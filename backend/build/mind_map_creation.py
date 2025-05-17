import pandas as pd
from datetime import datetime
from build.mind_map_utils import get_article_position

def build_mindmap_base(mindmap_data, articles):
    nodes = []
    edges = []

    df = pd.DataFrame(articles)
    # Parse date and filter
    start_date = datetime.strptime(mindmap_data["range"]["startdate"], "%Y-%m-%d")
    end_date = datetime.strptime(mindmap_data["range"]["enddate"], "%Y-%m-%d")
    df["time_published_dt"] = df["time_published"].apply(lambda x: datetime.strptime(x, "%Y%m%dT%H%M%S"))
    df = df[(df["time_published_dt"] >= start_date) & (df["time_published_dt"] <= end_date)]

    # ✅ Force consistent 3-letter month format
    df["month"] = df["time_published_dt"].dt.strftime("%b")
    # ---- 1. Topic + Ticker Nodes
    left_nodes = mindmap_data["topic"] + [mindmap_data["ticker"]]
    topic_and_ticker_ids = []

    for idx, label in enumerate(left_nodes, start=1):
        y = 100 + (idx - 1) * 200
        node_id = str(idx)
        nodes.append({
            "id": node_id,
            "data": {"label": label},
            "position": {"x": 100, "y": y},
            "sourcePosition": "right",
            "targetPosition": "left",
        })
        topic_and_ticker_ids.append((node_id, y))

    # ---- 2. General News (centered vertically between topic/ticker nodes)
    general_news_node_id = str(len(left_nodes) + 1)
    center_y = sum(y for _, y in topic_and_ticker_ids) / len(topic_and_ticker_ids)

    nodes.append({
        "id": general_news_node_id,
        "data": {"label": "General News"},
        "position": {"x": 300, "y": center_y},
        "sourcePosition": "right",
        "targetPosition": "left",
    })

    for node_id, _ in topic_and_ticker_ids:
        edges.append({
            "id": f"e{node_id}-{general_news_node_id}",
            "source": node_id,
            "target": general_news_node_id,
        })

    # ---- 3. Month Nodes (based on number of articles)
    month_article_counts = df["month"].value_counts().to_dict()
    sorted_months = pd.date_range(
        start=start_date, end=end_date, freq="MS"
    ).strftime("%b").tolist()

    max_articles = max(month_article_counts.values()) if month_article_counts else 1
    month_spacing = 300

    month_nodes = []
    for i, month in enumerate(sorted_months):
        month_id = f"{general_news_node_id}-month-{i+1}"

        count = month_article_counts.get(month, 0)
        relative_shift = ((count / max_articles) - 0.5) * 300 if max_articles > 0 else 0

        y = center_y + (i - (len(sorted_months) - 1)/2) * month_spacing + relative_shift

        nodes.append({
            "id": month_id,
            "data": {"label": month},
            "position": {"x": 500, "y": y},
            "sourcePosition": "right",
            "targetPosition": "left",
        })

        edges.append({
            "id": f"e{general_news_node_id}-{month_id}",
            "source": general_news_node_id,
            "target": month_id,
        })

        month_nodes.append((month_id, month, y))

    # ---- 4. Article Nodes and Source Nodes
    if not df.empty and "month" in df.columns and "source" in df.columns:
        grouped = df.groupby(["month", "source"])

        unique_sources = list(df["source"].unique())

        for (month, source), group in grouped:
            matching_month_node = next((m for m, label, y in month_nodes if label == month), None)
            if matching_month_node:
                y_base = next((y for m, label, y in month_nodes if m == matching_month_node), 0)
                source_y_base = y_base + 100 * (unique_sources.index(source) + 1)

                source_node_id = f"{matching_month_node}-source-{source.replace(' ', '_')}"
                nodes.append({
                    "id": source_node_id,
                    "data": {"label": source},
                    "position": {"x": 700, "y": source_y_base},
                    "sourcePosition": "right",
                    "targetPosition": "left",
                })

                edges.append({
                    "id": f"e{matching_month_node}-{source_node_id}",
                    "source": matching_month_node,
                    "target": source_node_id,
                })

                articles = list(group.iterrows())
                num_articles = len(articles)
                source_index = unique_sources.index(source)

                for idx, (_, row) in enumerate(articles):
                    article_node_id = f"{source_node_id}-article-{idx+1}"

                    color_map = {
                        "Bullish": "#48af00",
                        "Somewhat-Bullish": "#86c21d",
                        "Neutral": "#909090",
                        "Somewhat-Bearish": "#e77812",
                        "Bearish": "#ff0e0e",
                    }
                    sentiment_label = row.get("sentiment", {}).get("label", "Neutral")
                    sentiment_color = color_map.get(sentiment_label, "white")

                    position = get_article_position(
                        index=idx,
                        total_articles=num_articles,
                        source_index=source_index,
                        source_y_base=source_y_base
                    )

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
                    }

                    nodes.append({
                        "id": article_node_id,
                        "data": article_data,
                        "position": position,
                        "sourcePosition": "right",
                        "targetPosition": "left",
                    })

                    edges.append({
                        "id": f"e{source_node_id}-{article_node_id}",
                        "source": source_node_id,
                        "target": article_node_id,
                    })

    return {"nodes": nodes, "edges": edges}
