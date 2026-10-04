from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from pymongo import MongoClient
import random
import os
from build.mind_map_utils import (
    validate_playground_graph,
    compute_edge_counts,
    resolve_graph_for_publish,
)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)
db = client["User"]
dashboard_collection = db["Dashboard"]
process_collection = db["Process"]
processed_collection = db["OHLC_processed"]
db_sent_client = client["stock_sentiment"]
stock_sentiment_collection = db_sent_client["articles"]
entities_collection = db_sent_client["entities"]
entity_mentions_collection = db_sent_client["entity_mentions"]

api_router = APIRouter()

NOT_DELETED = {"deleted": {"$ne": True}}

VALID_STATUSES = {"New", "In-Progress", "Published"}


# ---------------------------------------------------------------------------
# Request / Response Models
# ---------------------------------------------------------------------------

class CreateMindmapRequest(BaseModel):
    name: str
    description: str = ""


class UpdateMindmapRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class SaveGraphRequest(BaseModel):
    playground_nodes: list
    playground_edges: list


# ---------------------------------------------------------------------------
# Mindmap CRUD
# ---------------------------------------------------------------------------

@api_router.post("/mindmap")
async def create_mindmap(req: CreateMindmapRequest):
    new_id = random.randint(100000, 999999)
    document = {
        "id": new_id,
        "name": req.name,
        "description": req.description,
        "status": "New",
        "node_count": 0,
        "article_count": 0,
        "deleted": False,
    }
    dashboard_collection.insert_one(document)

    process_collection.insert_one({
        "id": new_id,
        "playground_nodes": [],
        "playground_edges": [],
        "published_data": None,
        "deleted": False,
    })

    return {"success": True, "id": new_id}


@api_router.get("/mindmaps")
async def list_mindmaps():
    mindmaps = list(dashboard_collection.find(
        {**NOT_DELETED},
        {"_id": 0, "deleted": 0}
    ))
    return mindmaps


@api_router.get("/mindmap/{id}")
async def get_mindmap(id: int):
    meta = dashboard_collection.find_one({"id": id, **NOT_DELETED}, {"_id": 0, "deleted": 0})
    if not meta:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    process = process_collection.find_one({"id": id, **NOT_DELETED}, {"_id": 0, "deleted": 0})
    playground_nodes = process.get("playground_nodes", []) if process else []
    playground_edges = process.get("playground_edges", []) if process else []

    edge_counts = {}
    if playground_nodes and playground_edges:
        edge_counts = compute_edge_counts(
            playground_nodes, playground_edges,
            stock_sentiment_collection, entities_collection, entity_mentions_collection,
        )

    validation = validate_playground_graph(playground_nodes, playground_edges)

    result = {
        **meta,
        "playground_nodes": playground_nodes,
        "playground_edges": playground_edges,
        "edge_counts": edge_counts,
        "validation": validation,
    }

    if process and process.get("published_data"):
        result["published_data"] = process["published_data"]

    return result


@api_router.delete("/mindmap/{id}")
async def delete_mindmap(id: int):
    result = dashboard_collection.update_one(
        {"id": id, **NOT_DELETED},
        {"$set": {"deleted": True}}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    process_collection.update_one(
        {"id": id, **NOT_DELETED},
        {"$set": {"deleted": True}}
    )
    return {"success": True, "id": id}


@api_router.put("/mindmap/{id}")
async def update_mindmap(id: int, req: UpdateMindmapRequest):
    meta = dashboard_collection.find_one({"id": id, **NOT_DELETED})
    if not meta:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    updates = {}
    if req.name is not None:
        updates["name"] = req.name
    if req.description is not None:
        updates["description"] = req.description

    if not updates:
        raise HTTPException(status_code=400, detail="No fields to update")

    dashboard_collection.update_one({"id": id}, {"$set": updates})
    return {"success": True, "id": id, **updates}


@api_router.post("/mindmap/{id}/unpublish")
async def unpublish_mindmap(id: int):
    meta = dashboard_collection.find_one({"id": id, **NOT_DELETED})
    if not meta:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    if meta.get("status") != "Published":
        raise HTTPException(status_code=400, detail="Mindmap is not published")

    dashboard_collection.update_one(
        {"id": id},
        {"$set": {"status": "In-Progress"}}
    )
    process_collection.update_one(
        {"id": id, **NOT_DELETED},
        {"$set": {"published_data": None}}
    )
    return {"success": True, "id": id, "status": "In-Progress"}


# ---------------------------------------------------------------------------
# Playground — Graph Save (auto-save)
# ---------------------------------------------------------------------------

@api_router.put("/mindmap/{id}/graph")
async def save_graph(id: int, req: SaveGraphRequest):
    meta = dashboard_collection.find_one({"id": id, **NOT_DELETED})
    if not meta:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    validation = validate_playground_graph(req.playground_nodes, req.playground_edges)

    node_count = len(req.playground_nodes)
    new_status = meta.get("status", "New")
    if new_status == "New" and node_count > 0:
        new_status = "In-Progress"
    elif new_status == "Published":
        new_status = "In-Progress"

    process_collection.update_one(
        {"id": id, **NOT_DELETED},
        {"$set": {
            "playground_nodes": req.playground_nodes,
            "playground_edges": req.playground_edges,
        }},
        upsert=True,
    )

    dashboard_collection.update_one(
        {"id": id},
        {"$set": {"status": new_status, "node_count": node_count}}
    )

    edge_counts = {}
    if req.playground_nodes and req.playground_edges:
        edge_counts = compute_edge_counts(
            req.playground_nodes, req.playground_edges,
            stock_sentiment_collection, entities_collection, entity_mentions_collection,
        )

    return {
        "success": True,
        "status": new_status,
        "node_count": node_count,
        "edge_counts": edge_counts,
        "validation": validation,
    }


# ---------------------------------------------------------------------------
# Playground — Publish
# ---------------------------------------------------------------------------

@api_router.post("/mindmap/{id}/publish")
async def publish_mindmap(id: int):
    meta = dashboard_collection.find_one({"id": id, **NOT_DELETED})
    if not meta:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    process = process_collection.find_one({"id": id, **NOT_DELETED})
    if not process:
        raise HTTPException(status_code=404, detail="Mindmap graph not found")

    nodes = process.get("playground_nodes", [])
    edges = process.get("playground_edges", [])

    validation = validate_playground_graph(nodes, edges)
    if not validation["publishable"]:
        raise HTTPException(
            status_code=400,
            detail={"message": "Graph is not ready to publish", "errors": validation["errors"]}
        )

    import time
    start_time = time.time()

    result = resolve_graph_for_publish(
        nodes, edges,
        stock_sentiment_collection, entities_collection, entity_mentions_collection,
    )

    duration_ms = int((time.time() - start_time) * 1000)

    edge_counts = compute_edge_counts(
        nodes, edges,
        stock_sentiment_collection, entities_collection, entity_mentions_collection,
    )

    published_data = {
        "articles": result["articles"],
        "entities": result["entities"],
        "article_count": result["article_count"],
        "edge_counts": edge_counts,
        "published_at": time.time(),
        "retrieval_duration_ms": duration_ms,
    }

    process_collection.update_one(
        {"id": id, **NOT_DELETED},
        {"$set": {"published_data": published_data}}
    )

    dashboard_collection.update_one(
        {"id": id},
        {"$set": {
            "status": "Published",
            "article_count": result["article_count"],
            "node_count": len(nodes),
        }}
    )

    return {
        "success": True,
        "status": "Published",
        "article_count": result["article_count"],
        "entity_count": len(result["entities"]),
        "retrieval_duration_ms": duration_ms,
    }


# ---------------------------------------------------------------------------
# Playground — Edge Counts
# ---------------------------------------------------------------------------

@api_router.get("/mindmap/{id}/edge-counts")
async def get_edge_counts(id: int):
    process = process_collection.find_one({"id": id, **NOT_DELETED})
    if not process:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    nodes = process.get("playground_nodes", [])
    edges = process.get("playground_edges", [])

    edge_counts = compute_edge_counts(
        nodes, edges,
        stock_sentiment_collection, entities_collection, entity_mentions_collection,
    )
    return {"edge_counts": edge_counts}


# ---------------------------------------------------------------------------
# Entities — Post-Publish
# ---------------------------------------------------------------------------

@api_router.get("/mindmap/{id}/entities")
async def get_mindmap_entities(id: int):
    meta = dashboard_collection.find_one({"id": id, **NOT_DELETED})
    if not meta:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    if meta.get("status") != "Published":
        raise HTTPException(status_code=400, detail="Entities are only available after publishing")

    process = process_collection.find_one({"id": id, **NOT_DELETED})
    if not process or not process.get("published_data"):
        raise HTTPException(status_code=404, detail="Published data not found")

    return {
        "entities": process["published_data"].get("entities", []),
        "article_count": process["published_data"].get("article_count", 0),
    }


@api_router.get("/mindmap/{id}/articles")
async def get_mindmap_articles(id: int):
    meta = dashboard_collection.find_one({"id": id, **NOT_DELETED})
    if not meta:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    if meta.get("status") != "Published":
        raise HTTPException(status_code=400, detail="Articles are only available after publishing")

    process = process_collection.find_one({"id": id, **NOT_DELETED})
    if not process or not process.get("published_data"):
        raise HTTPException(status_code=404, detail="Published data not found")

    return {
        "articles": process["published_data"].get("articles", []),
        "article_count": process["published_data"].get("article_count", 0),
    }


# ---------------------------------------------------------------------------
# Status
# ---------------------------------------------------------------------------

@api_router.get("/status")
async def get_status(id: int):
    mindmap = dashboard_collection.find_one({"id": id, **NOT_DELETED})
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    return {"id": id, "status": mindmap.get("status", "New")}


# ---------------------------------------------------------------------------
# Article Counts (kept for live edge-count support and general use)
# ---------------------------------------------------------------------------

def build_article_query(ticker, topic_list):
    topic_or = []
    for t in topic_list:
        pat = {"$regex": f"^{t}$", "$options": "i"}
        topic_or.append({"topic": pat})
        topic_or.append({"topics.topic": pat})
    return {"ticker": ticker, "$or": topic_or}


@api_router.get("/article-counts")
async def get_article_counts(ticker: str, topics: str):
    topic_list = [t.strip() for t in topics.split(",")]
    query = build_article_query(ticker, topic_list)

    pipeline = [
        {"$match": query},
        {"$project": {
            "date": {"$substr": ["$time_published", 0, 8]}
        }},
        {"$group": {
            "_id": "$date",
            "count": {"$sum": 1}
        }},
        {"$sort": {"_id": 1}}
    ]
    results = list(stock_sentiment_collection.aggregate(pipeline))
    date_counts = {}
    total = 0
    for r in results:
        raw = r["_id"]
        formatted = f"{raw[:4]}-{raw[4:6]}-{raw[6:8]}"
        date_counts[formatted] = r["count"]
        total += r["count"]

    return {"ticker": ticker, "topics": topic_list, "total": total, "dates": date_counts}


# ---------------------------------------------------------------------------
# Node Details
# ---------------------------------------------------------------------------

@app.get("/api/node-details")
async def get_node_details(mindmap_id: Optional[int] = None, node_id: Optional[str] = None):
    if not mindmap_id or not node_id:
        return {"error": "mindmap_id and node_id are both required."}

    process = process_collection.find_one({"id": mindmap_id, **NOT_DELETED}, {"_id": 0, "deleted": 0})
    if not process:
        return {"error": f"No mindmap found with id {mindmap_id}"}

    all_nodes = process.get("playground_nodes", [])
    if process.get("published_data") and process["published_data"].get("articles"):
        pass

    node_info = next((node for node in all_nodes if node.get("id") == node_id), None)
    if not node_info:
        return {"error": f"No node found with id {node_id} in mindmap {mindmap_id}"}

    node_data = node_info.get("data", {})

    return {
        "mindmap_id": mindmap_id,
        "node_id": node_id,
        "details": node_data,
        "type": node_info.get("type", ""),
    }


# ---------------------------------------------------------------------------
# Entity Endpoints (kept from v1)
# ---------------------------------------------------------------------------

@api_router.get("/entities")
async def list_entities(entity_type: Optional[str] = None, limit: int = 50):
    query = {}
    if entity_type:
        query["type"] = entity_type
    entities = list(entities_collection.find(query, {"_id": 0}).sort("last_seen", -1).limit(limit))
    for e in entities:
        e["mention_count"] = entity_mentions_collection.count_documents({"entity_id": e.get("_id")})
    return entities


@api_router.get("/entities/search")
async def search_entities(q: str):
    entities = list(entities_collection.find(
        {"canonical_name": {"$regex": q, "$options": "i"}},
        {"_id": 0}
    ).limit(20))
    return entities


@api_router.get("/entities/{entity_name}/articles")
async def get_entity_articles(entity_name: str, limit: int = 20):
    entity = entities_collection.find_one(
        {"canonical_name": {"$regex": f"^{entity_name}$", "$options": "i"}}
    )
    if not entity:
        raise HTTPException(status_code=404, detail="Entity not found")

    mentions = list(entity_mentions_collection.find(
        {"entity_id": entity["_id"]}
    ).limit(limit))

    article_ids = [m["article_id"] for m in mentions]
    articles = list(stock_sentiment_collection.find(
        {"_id": {"$in": article_ids}},
        {"_id": 1, "title": 1, "url": 1, "source": 1, "ticker": 1,
         "time_published": 1, "overall_sentiment_label": 1, "summary": 1}
    ))

    return {
        "entity": entity.get("canonical_name"),
        "type": entity.get("type"),
        "article_count": len(articles),
        "articles": articles,
    }


@api_router.get("/article/{article_id}/entities")
async def get_article_entities(article_id: str):
    mentions = list(entity_mentions_collection.find({"article_id": article_id}))
    entity_ids = [m["entity_id"] for m in mentions]
    entities = list(entities_collection.find(
        {"_id": {"$in": entity_ids}},
        {"_id": 0, "canonical_name": 1, "type": 1}
    ))
    return entities


@api_router.get("/entities/cross-ticker")
async def get_cross_ticker_entities(limit: int = 30):
    pipeline = [
        {"$group": {
            "_id": "$entity_id",
            "tickers": {"$addToSet": "$ticker"},
            "article_count": {"$sum": 1},
        }},
        {"$match": {"tickers.1": {"$exists": True}}},
        {"$sort": {"article_count": -1}},
        {"$limit": limit},
    ]
    results = list(entity_mentions_collection.aggregate(pipeline))

    cross_entities = []
    for r in results:
        entity = entities_collection.find_one({"_id": r["_id"]}, {"_id": 0, "canonical_name": 1, "type": 1})
        if entity:
            ticker_counts = {}
            for ticker in r["tickers"]:
                ticker_counts[ticker] = entity_mentions_collection.count_documents({
                    "entity_id": r["_id"], "ticker": ticker
                })
            cross_entities.append({
                "name": entity["canonical_name"],
                "type": entity["type"],
                "tickers": r["tickers"],
                "ticker_counts": ticker_counts,
                "total_mentions": r["article_count"],
            })

    return cross_entities


@api_router.get("/article-mindmaps")
async def find_article_mindmaps(url: str):
    mindmaps = list(process_collection.find(
        {**NOT_DELETED, "published_data.articles.url": url},
        {"_id": 0, "id": 1}
    ))
    results = [{"mindmap_id": m["id"]} for m in mindmaps]
    return results


app.include_router(api_router, prefix="/api")
