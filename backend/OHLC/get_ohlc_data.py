from pymongo import MongoClient
from datetime import datetime, timedelta

client = MongoClient("mongodb://root:example@localhost:27017/")
db = client["OHLC"]
processed_collection = db["OHLC_processed"]

def fetch_ohlc_data(ticker: str, time_published: str):
    try:
        query_date = datetime.strptime(time_published, "%Y-%m-%d %H:%M:%S")
        month_str = query_date.strftime("%Y-%m")
        week_num = str(query_date.isocalendar().week)

        raw_collection = db[ticker]

        prev_date = query_date - timedelta(days=1)
        next_date = query_date + timedelta(days=1)

        def find_day(d):
            return raw_collection.find_one({
                "Date": {
                    "$gte": datetime(d.year, d.month, d.day),
                    "$lt": datetime(d.year, d.month, d.day) + timedelta(days=1)
                }
            },{"_id":0})

        daily = {
            "previous": find_day(prev_date),
            "current": find_day(query_date),
            "next": find_day(next_date),
        }

        processed = processed_collection.find_one({"ticker": ticker, "month": month_str},{"_id": 0})
        monthly_avg = processed.get("monthly_avg") if processed else None
        weekly_avg = processed.get("weekly_avgs", {}).get(week_num) if processed else None

        return {
            "ticker": ticker,
            "date": query_date.strftime("%Y-%m-%d"),
            "ohlc": {
                "monthly_avg": monthly_avg,
                "weekly_avg": weekly_avg,
                "daily": daily,
            },
        }

    except Exception as e:
        return {"error": str(e)}
