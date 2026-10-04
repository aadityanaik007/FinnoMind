import pandas as pd
import math
from datetime import datetime


def build_mindmap_base(mindmap_data, articles):
    nodes = []
    edges = []

    df = pd.DataFrame(articles)
    start_date = datetime.strptime(mindmap_data["range"]["startdate"], "%Y-%m-%d")
    end_date = datetime.strptime(mindmap_data["range"]["enddate"], "%Y-%m-%d").replace(hour=23, minute=59, second=59)

    if not df.empty and "time_published" in df.columns:
        df["time_published_dt"] = df["time_published"].apply(lambda x: datetime.strptime(x, "%Y%m%dT%H%M%S"))
        df = df[(df["time_published_dt"] >= start_date) & (df["time_published_dt"] <= end_date)]
        df["month"] = df["time_published_dt"].dt.strftime("%b")
        df = df.sort_values("time_published_dt", ascending=False)
    else:
        df = pd.DataFrame()

    cx, cy = 700, 500

    # ---- 1. Single center node combining topics + ticker
    nodes.append({
        "id": "center",
        "data": {
            "label": mindmap_data["ticker"],
            "topics": mindmap_data["topic"],
            "ticker": mindmap_data["ticker"],
            "isCenterNode": True,
        },
        "position": {"x": cx, "y": cy},
        "sourcePosition": "right",
        "targetPosition": "left",
    })

    # ---- 2. Month nodes radially around center
    month_article_counts = df["month"].value_counts().to_dict() if not df.empty and "month" in df.columns else {}

    first_of_start = start_date.replace(day=1)
    sorted_months = pd.date_range(start=first_of_start, end=end_date, freq="MS").strftime("%b").tolist()
    if not sorted_months and month_article_counts:
        sorted_months = list(month_article_counts.keys())

    n_months = len(sorted_months)
    month_radius = 300
    month_nodes = []

    for i, month in enumerate(sorted_months):
        angle = (2 * math.pi * i / max(n_months, 1)) - math.pi / 2
        mx = cx + month_radius * math.cos(angle)
        my = cy + month_radius * math.sin(angle)
        month_id = f"month-{i+1}"

        count = month_article_counts.get(month, 0)
        nodes.append({
            "id": month_id,
            "data": {"label": f"{month} ({count})", "isMonthNode": True},
            "position": {"x": mx, "y": my},
        })
        edges.append({"id": f"e-center-{month_id}", "source": "center", "target": month_id})
        month_nodes.append((month_id, month, mx, my))

    # ---- 3. Source + Article nodes around each month
    if not df.empty and "month" in df.columns and "source" in df.columns:
        for month_id, month_label, mx, my in month_nodes:
            month_df = df[df["month"] == month_label]
            if month_df.empty:
                continue

            sources = list(month_df["source"].unique())
            n_sources = len(sources)
            source_radius = 200

            for si, source in enumerate(sources):
                source_angle_offset = (2 * math.pi * si / max(n_sources, 1))
                base_angle = math.atan2(my - cy, mx - cx)
                spread = math.pi * 0.8
                source_angle = base_angle - spread / 2 + spread * si / max(n_sources - 1, 1) if n_sources > 1 else base_angle

                sx = mx + source_radius * math.cos(source_angle)
                sy = my + source_radius * math.sin(source_angle)

                source_node_id = f"{month_id}-source-{source.replace(' ', '_')}"
                source_df = month_df[month_df["source"] == source].sort_values("time_published_dt", ascending=False)
                total_articles = len(source_df)

                nodes.append({
                    "id": source_node_id,
                    "data": {
                        "label": source,
                        "isSourceNode": True,
                        "articleCount": total_articles,
                        "pageSize": 5,
                    },
                    "position": {"x": sx, "y": sy},
                })
                edges.append({"id": f"e-{month_id}-{source_node_id}", "source": month_id, "target": source_node_id})

                # Article nodes around the source
                article_radius = 140
                for idx, (_, row) in enumerate(source_df.iterrows()):
                    article_node_id = f"{source_node_id}-article-{idx+1}"

                    n_visible = min(5, total_articles)
                    article_angle_base = math.atan2(sy - my, sx - mx)
                    article_spread = math.pi * 0.6
                    pos_in_page = idx % 5
                    a_angle = article_angle_base - article_spread / 2 + article_spread * pos_in_page / max(n_visible - 1, 1) if n_visible > 1 else article_angle_base

                    ax = sx + article_radius * math.cos(a_angle)
                    ay = sy + article_radius * math.sin(a_angle)

                    color_map = {
                        "Bullish": "#48af00",
                        "Somewhat-Bullish": "#86c21d",
                        "Neutral": "#909090",
                        "Somewhat-Bearish": "#e77812",
                        "Bearish": "#ff0e0e",
                    }
                    sentiment_label = row.get("sentiment", {}).get("label", "Neutral") if isinstance(row.get("sentiment"), dict) else "Neutral"
                    sentiment_color = color_map.get(sentiment_label, "white")

                    article_data = {
                        "label": str(idx + 1),
                        "color": sentiment_color,
                        "title": row.get("title"),
                        "url": row.get("url"),
                        "time_published": datetime.strptime(row.get("time_published"), "%Y%m%dT%H%M%S").strftime("%Y-%m-%d %H:%M:%S"),
                        "summary": row.get("summary"),
                        "banner_image": row.get("banner_image"),
                        "source": row.get("source"),
                        "topics": row.get("topics"),
                        "overall_sentiment_score": row.get("overall_sentiment_score"),
                        "overall_sentiment_label": row.get("overall_sentiment_label"),
                        "ticker_sentiment": row.get("ticker_sentiment"),
                        "sourceNodeId": source_node_id,
                        "articleIndex": idx,
                    }

                    nodes.append({
                        "id": article_node_id,
                        "data": article_data,
                        "position": {"x": ax, "y": ay},
                    })
                    edges.append({"id": f"e-{source_node_id}-{article_node_id}", "source": source_node_id, "target": article_node_id})

    return {"nodes": nodes, "edges": edges, "article_count": len(df)}
