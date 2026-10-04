from pymongo import MongoClient
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
import yfinance as yf
import pandas as pd

load_dotenv()

client = MongoClient(os.getenv("MONGO_URI", "mongodb://root:example@localhost:27018/?authSource=admin"))
db = client["OHLC"]
processed_collection = db["OHLC_processed"]

_cache = {}


def _get_yf_data(ticker, start, end):
    key = f"{ticker}_{start}_{end}"
    if key in _cache:
        return _cache[key]
    try:
        t = yf.Ticker(ticker)
        df = t.history(start=start, end=end, auto_adjust=True)
        if df.empty:
            _cache[key] = pd.DataFrame()
            return _cache[key]
        if isinstance(df.columns, pd.MultiIndex):
            df.columns = df.columns.get_level_values(0)
        df.index = pd.to_datetime(df.index).tz_localize(None)
        _cache[key] = df
        return df
    except Exception as e:
        print(f"yfinance error for {ticker}: {e}")
        _cache[key] = pd.DataFrame()
        return _cache[key]


def _row_to_dict(row, date_str=None):
    return {
        "Date": date_str or "",
        "Open": round(float(row["Open"]), 2),
        "High": round(float(row["High"]), 2),
        "Low": round(float(row["Low"]), 2),
        "Close": round(float(row["Close"]), 2),
        "Volume": int(row["Volume"]),
    }


def _avg_dict(df):
    if df.empty:
        return None
    return {
        "open": round(float(df["Open"].mean()), 2),
        "high": round(float(df["High"].mean()), 2),
        "low": round(float(df["Low"].mean()), 2),
        "close": round(float(df["Close"].mean()), 2),
        "volume": int(df["Volume"].mean()),
    }


def fetch_ohlc_data(ticker: str, time_published: str):
    try:
        query_date = datetime.strptime(time_published, "%Y-%m-%d %H:%M:%S")
        month_str = query_date.strftime("%Y-%m")
        week_num = str(query_date.isocalendar().week)

        raw_collection = db[ticker]
        prev_date = query_date - timedelta(days=1)
        next_date = query_date + timedelta(days=1)

        def find_day_db(d):
            return raw_collection.find_one({
                "Date": {
                    "$gte": datetime(d.year, d.month, d.day),
                    "$lt": datetime(d.year, d.month, d.day) + timedelta(days=1)
                }
            }, {"_id": 0})

        processed = processed_collection.find_one({"ticker": ticker, "month": month_str}, {"_id": 0})
        monthly_avg = processed.get("monthly_avg") if processed else None
        weekly_avg = processed.get("weekly_avgs", {}).get(week_num) if processed else None

        db_prev = find_day_db(prev_date)
        db_curr = find_day_db(query_date)
        db_next = find_day_db(next_date)

        need_yf = (not db_prev or not db_curr or not db_next or not monthly_avg or not weekly_avg)

        if need_yf:
            first_of_month = query_date.replace(day=1)
            last_of_month = (first_of_month + timedelta(days=32)).replace(day=1)
            fetch_start = min(first_of_month, prev_date) - timedelta(days=1)
            fetch_end = max(last_of_month, next_date) + timedelta(days=2)
            df = _get_yf_data(ticker, fetch_start.strftime("%Y-%m-%d"), fetch_end.strftime("%Y-%m-%d"))

            if not df.empty:
                def yf_day(d):
                    date_str = d.strftime("%Y-%m-%d")
                    mask = df.index.strftime("%Y-%m-%d") == date_str
                    if mask.any():
                        return _row_to_dict(df[mask].iloc[0], date_str)
                    return None

                if not db_prev:
                    db_prev = yf_day(prev_date)
                if not db_curr:
                    db_curr = yf_day(query_date)
                if not db_next:
                    db_next = yf_day(next_date)

                if not monthly_avg:
                    m_start = first_of_month.strftime("%Y-%m-%d")
                    m_end = last_of_month.strftime("%Y-%m-%d")
                    month_df = df[(df.index >= m_start) & (df.index < m_end)]
                    monthly_avg = _avg_dict(month_df)

                if not weekly_avg:
                    day_of_week = query_date.weekday()
                    w_start = (query_date - timedelta(days=day_of_week)).strftime("%Y-%m-%d")
                    w_end = (query_date - timedelta(days=day_of_week) + timedelta(days=5)).strftime("%Y-%m-%d")
                    week_df = df[(df.index >= w_start) & (df.index < w_end)]
                    weekly_avg = _avg_dict(week_df)

        return {
            "ticker": ticker,
            "date": query_date.strftime("%Y-%m-%d"),
            "ohlc": {
                "monthly_avg": monthly_avg,
                "weekly_avg": weekly_avg,
                "daily": {
                    "previous": db_prev,
                    "current": db_curr,
                    "next": db_next,
                },
            },
        }

    except Exception as e:
        return {"error": str(e)}
