from collections import defaultdict
from datetime import datetime


VALID_CONNECTIONS = {
    ("ticker", "topic"),
    ("topic", "entity"),
    ("topic", "retrieve"),
    ("entity", "retrieve"),
}

MAX_TICKERS = 3
MAX_TOPICS = 2
MAX_ENTITIES = 2
MAX_RETRIEVES = 1


def validate_playground_graph(nodes, edges):
    errors = []
    node_map = {n["id"]: n for n in nodes}

    type_counts = defaultdict(int)
    for n in nodes:
        type_counts[n.get("type", "")] += 1

    if type_counts["ticker"] > MAX_TICKERS:
        errors.append(f"Maximum {MAX_TICKERS} Ticker nodes allowed")
    if type_counts["topic"] > MAX_TOPICS:
        errors.append(f"Maximum {MAX_TOPICS} Topic nodes allowed")
    if type_counts["entity"] > MAX_ENTITIES:
        errors.append(f"Maximum {MAX_ENTITIES} Entity nodes allowed")
    if type_counts["retrieve"] > MAX_RETRIEVES:
        errors.append(f"Only 1 Retrieve node allowed per mindmap")

    for edge in edges:
        source = node_map.get(edge["source"])
        target = node_map.get(edge["target"])
        if not source or not target:
            errors.append(f"Edge references unknown node")
            continue
        pair = (source.get("type", ""), target.get("type", ""))
        if pair not in VALID_CONNECTIONS:
            errors.append(f"Invalid connection: {pair[0]} → {pair[1]}")

    if _has_cycle(nodes, edges):
        errors.append("Graph contains a cycle")

    all_connected = _all_branches_reach_retrieve(nodes, edges)
    is_publishable = (
        len(errors) == 0
        and type_counts["retrieve"] == 1
        and type_counts["ticker"] >= 1
        and type_counts["topic"] >= 1
        and all_connected
    )

    if not all_connected and len(nodes) > 0 and type_counts["retrieve"] >= 1:
        errors.append("Not all branches connect to the Retrieve node")

    return {"valid": len(errors) == 0, "publishable": is_publishable, "errors": errors}


def _has_cycle(nodes, edges):
    adj = defaultdict(list)
    for edge in edges:
        adj[edge["source"]].append(edge["target"])

    visited = set()
    in_stack = set()

    def dfs(node_id):
        visited.add(node_id)
        in_stack.add(node_id)
        for neighbor in adj[node_id]:
            if neighbor in in_stack:
                return True
            if neighbor not in visited:
                if dfs(neighbor):
                    return True
        in_stack.discard(node_id)
        return False

    for n in nodes:
        if n["id"] not in visited:
            if dfs(n["id"]):
                return True
    return False


def _all_branches_reach_retrieve(nodes, edges):
    node_map = {n["id"]: n for n in nodes}
    retrieve_nodes = [n for n in nodes if n.get("type") == "retrieve"]
    if not retrieve_nodes:
        return False

    retrieve_id = retrieve_nodes[0]["id"]
    outgoing = defaultdict(list)
    for edge in edges:
        outgoing[edge["source"]].append(edge["target"])

    def can_reach_retrieve(node_id, visited=None):
        if visited is None:
            visited = set()
        if node_id == retrieve_id:
            return True
        if node_id in visited:
            return False
        visited.add(node_id)
        for target in outgoing[node_id]:
            if can_reach_retrieve(target, visited):
                return True
        return False

    leaf_nodes = [n for n in nodes if n.get("type") != "retrieve" and len(outgoing[n["id"]]) == 0]
    if leaf_nodes:
        return False

    for n in nodes:
        if n.get("type") == "retrieve":
            continue
        if not can_reach_retrieve(n["id"]):
            return False

    return True


def compute_edge_counts(playground_nodes, playground_edges, article_collection,
                        entities_col=None, entity_mentions_col=None):
    node_map = {n["id"]: n for n in playground_nodes}
    incoming = defaultdict(list)
    for edge in playground_edges:
        incoming[edge["target"]].append(edge["source"])

    edge_counts = {}

    for edge in playground_edges:
        source = node_map.get(edge["source"])
        target = node_map.get(edge["target"])
        if not source or not target:
            edge_counts[edge["id"]] = 0
            continue

        st = source.get("type", "")
        tt = target.get("type", "")

        if st == "ticker" and tt == "topic":
            edge_counts[edge["id"]] = _count_ticker_topic(
                source, target, article_collection
            )
        elif st == "topic" and tt == "entity":
            pool = _get_topic_article_pool(
                target_topic=source, node_map=node_map,
                incoming=incoming, article_collection=article_collection
            )
            edge_counts[edge["id"]] = _filter_pool_by_entity(
                pool, target, entities_col, entity_mentions_col
            )
        elif st == "topic" and tt == "retrieve":
            pool = _get_topic_article_pool(
                target_topic=source, node_map=node_map,
                incoming=incoming, article_collection=article_collection
            )
            edge_counts[edge["id"]] = len(pool)
        elif st == "entity" and tt == "retrieve":
            topic_sources = [
                node_map[sid] for sid in incoming.get(source["id"], [])
                if node_map.get(sid, {}).get("type") == "topic"
            ]
            total = 0
            for topic in topic_sources:
                pool = _get_topic_article_pool(
                    target_topic=topic, node_map=node_map,
                    incoming=incoming, article_collection=article_collection
                )
                total += _filter_pool_by_entity(
                    pool, source, entities_col, entity_mentions_col
                )
            edge_counts[edge["id"]] = total
        else:
            edge_counts[edge["id"]] = 0

    return edge_counts


def _build_article_query_for_ticker_topic(ticker_symbol, topic_name, date_range):
    pat = {"$regex": f"^{topic_name}$", "$options": "i"}
    query = {
        "ticker": ticker_symbol,
        "$or": [{"topic": pat}, {"topics.topic": pat}],
    }
    if date_range:
        start = date_range.get("start") or date_range.get("startdate")
        end = date_range.get("end") or date_range.get("enddate")
        if start and end:
            start_str = start.replace("-", "") + "T000000"
            end_str = end.replace("-", "") + "T235959"
            query["time_published"] = {"$gte": start_str, "$lte": end_str}
    return query


def _count_ticker_topic(ticker_node, topic_node, article_collection):
    ticker_data = ticker_node.get("data", {})
    topic_data = topic_node.get("data", {})
    symbol = ticker_data.get("symbol", "")
    topic_name = topic_data.get("name", "")
    date_range = ticker_data.get("dateRange", {})
    query = _build_article_query_for_ticker_topic(symbol, topic_name, date_range)
    return article_collection.count_documents(query)


def _get_topic_article_pool(target_topic, node_map, incoming, article_collection):
    topic_data = target_topic.get("data", {})
    topic_name = topic_data.get("name", "")

    upstream_tickers = [
        node_map[sid] for sid in incoming.get(target_topic["id"], [])
        if node_map.get(sid, {}).get("type") == "ticker"
    ]

    all_article_ids = set()
    for ticker_node in upstream_tickers:
        ticker_data = ticker_node.get("data", {})
        symbol = ticker_data.get("symbol", "")
        date_range = ticker_data.get("dateRange", {})
        query = _build_article_query_for_ticker_topic(symbol, topic_name, date_range)
        articles = article_collection.find(query, {"_id": 1})
        for a in articles:
            all_article_ids.add(a["_id"])

    return list(all_article_ids)


def _filter_pool_by_entity(article_ids, entity_node, entities_col, entity_mentions_col):
    if entities_col is None or entity_mentions_col is None or not article_ids:
        return 0

    entity_data = entity_node.get("data", {})
    entity_name = entity_data.get("name", "")
    entity = entities_col.find_one(
        {"canonical_name": {"$regex": f"^{entity_name}$", "$options": "i"}}
    )
    if not entity:
        return 0

    count = entity_mentions_col.count_documents({
        "entity_id": entity["_id"],
        "article_id": {"$in": article_ids},
    })
    return count


def resolve_graph_for_publish(playground_nodes, playground_edges,
                              article_collection, entities_col, entity_mentions_col):
    node_map = {n["id"]: n for n in playground_nodes}
    incoming = defaultdict(list)
    for edge in playground_edges:
        incoming[edge["target"]].append(edge["source"])

    retrieve_nodes = [n for n in playground_nodes if n.get("type") == "retrieve"]
    if not retrieve_nodes:
        return {"articles": [], "entities": [], "article_count": 0, "related": [], "unrelated": []}

    all_article_ids = set()
    related_ids = set()
    unrelated_ids = set()

    entity_sources = [
        node_map[sid] for sid in incoming.get(retrieve_nodes[0]["id"], [])
        if node_map.get(sid, {}).get("type") == "entity"
    ]
    topic_sources = [
        node_map[sid] for sid in incoming.get(retrieve_nodes[0]["id"], [])
        if node_map.get(sid, {}).get("type") == "topic"
    ]

    for topic in topic_sources:
        pool = _get_topic_article_pool(topic, node_map, incoming, article_collection)
        all_article_ids.update(pool)

    for entity_node in entity_sources:
        topic_parents = [
            node_map[sid] for sid in incoming.get(entity_node["id"], [])
            if node_map.get(sid, {}).get("type") == "topic"
        ]
        for topic in topic_parents:
            pool = _get_topic_article_pool(topic, node_map, incoming, article_collection)
            filtered = _filter_pool_by_entity_ids(
                pool, entity_node, entities_col, entity_mentions_col
            )
            all_article_ids.update(filtered)

    _compute_related_unrelated(
        playground_nodes, incoming, node_map, article_collection,
        all_article_ids, related_ids, unrelated_ids
    )

    articles = list(article_collection.find(
        {"_id": {"$in": list(all_article_ids)}},
        {"_id": 1, "title": 1, "url": 1, "source": 1, "ticker": 1,
         "time_published": 1, "overall_sentiment_label": 1, "summary": 1,
         "topics": 1, "overall_sentiment_score": 1}
    ))

    pinned_entity_names = [
        n.get("data", {}).get("name", "")
        for n in playground_nodes if n.get("type") == "entity"
    ]

    entity_list = _extract_entities_from_articles(
        all_article_ids, entities_col, entity_mentions_col, pinned_entity_names
    )

    for a in articles:
        a["_id"] = str(a["_id"])
        a_id_orig = a["_id"]
        if a_id_orig in {str(r) for r in related_ids}:
            a["category"] = "related"
        elif a_id_orig in {str(u) for u in unrelated_ids}:
            a["category"] = "unrelated"
        else:
            a["category"] = "related"

    return {
        "articles": articles,
        "entities": entity_list,
        "article_count": len(all_article_ids),
    }


def _filter_pool_by_entity_ids(article_ids, entity_node, entities_col, entity_mentions_col):
    if entities_col is None or entity_mentions_col is None or not article_ids:
        return []

    entity_data = entity_node.get("data", {})
    entity_name = entity_data.get("name", "")
    entity = entities_col.find_one(
        {"canonical_name": {"$regex": f"^{entity_name}$", "$options": "i"}}
    )
    if not entity:
        return []

    mentions = entity_mentions_col.find(
        {"entity_id": entity["_id"], "article_id": {"$in": list(article_ids)}},
        {"article_id": 1}
    )
    return [m["article_id"] for m in mentions]


def _compute_related_unrelated(nodes, incoming, node_map, article_collection,
                               all_article_ids, related_ids, unrelated_ids):
    topics = [n for n in nodes if n.get("type") == "topic"]

    for topic in topics:
        upstream_tickers = [
            node_map[sid] for sid in incoming.get(topic["id"], [])
            if node_map.get(sid, {}).get("type") == "ticker"
        ]
        if len(upstream_tickers) <= 1:
            continue

        date_ranges = []
        for t in upstream_tickers:
            dr = t.get("data", {}).get("dateRange", {})
            start = dr.get("start") or dr.get("startdate", "")
            end = dr.get("end") or dr.get("enddate", "")
            if start and end:
                date_ranges.append((start.replace("-", ""), end.replace("-", "")))

        if not date_ranges:
            continue

        overlap_start = max(dr[0] for dr in date_ranges)
        overlap_end = min(dr[1] for dr in date_ranges)

        if overlap_start > overlap_end:
            unrelated_ids.update(all_article_ids)
            return

        overlap_start_str = overlap_start + "T000000"
        overlap_end_str = overlap_end + "T235959"

        for aid in all_article_ids:
            article = article_collection.find_one({"_id": aid}, {"time_published": 1})
            if article:
                tp = article.get("time_published", "")
                if overlap_start_str <= tp <= overlap_end_str:
                    related_ids.add(aid)
                else:
                    unrelated_ids.add(aid)


def _extract_entities_from_articles(article_ids, entities_col, entity_mentions_col,
                                    pinned_entity_names):
    if entities_col is None or entity_mentions_col is None or not article_ids:
        return []

    pipeline = [
        {"$match": {"article_id": {"$in": list(article_ids)}}},
        {"$group": {"_id": "$entity_id", "mention_count": {"$sum": 1}}},
        {"$sort": {"mention_count": -1}},
        {"$limit": 50},
    ]
    results = list(entity_mentions_col.aggregate(pipeline))

    entity_list = []
    for r in results:
        entity = entities_col.find_one({"_id": r["_id"]}, {"_id": 0, "canonical_name": 1, "type": 1})
        if entity:
            is_pinned = any(
                entity["canonical_name"].lower() == p.lower()
                for p in pinned_entity_names if p
            )
            entity_list.append({
                "name": entity["canonical_name"],
                "type": entity.get("type", "Other"),
                "mention_count": r["mention_count"],
                "pinned": is_pinned,
            })

    pinned = [e for e in entity_list if e["pinned"]]
    unpinned = [e for e in entity_list if not e["pinned"]]
    return pinned + unpinned
