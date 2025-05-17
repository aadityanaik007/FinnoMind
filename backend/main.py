from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from pymongo import MongoClient
import random
import os
from celery_repo.task import process_mindmap
from build.mind_map_creation import build_mindmap_base
from fastapi import HTTPException
from bson.regex import Regex
from OHLC.get_ohlc_data import fetch_ohlc_data
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Setup
MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:example@localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["User"]
dashboard_collection = db["Dashboard"]
process_collection = db["Process"]
processed_collection = db["OHLC_processed"]
db_sent_client = client["stock_sentiment"]
stock_sentiment_collection = db_sent_client["articles"]
api_router = APIRouter()

class MindMapRequest(BaseModel):
    topic: list
    ticker: str
    range: dict
    status: Optional[str] = "pending"


@api_router.post("/mindmap")
async def create_mindmap(mindmap: MindMapRequest):
    new_id = random.randint(1000, 9999)

    document = {
        "id": new_id,
        "topic": mindmap.topic,
        "ticker": mindmap.ticker,
        "range": mindmap.range,
        "status": "pending",
    }

    dashboard_collection.insert_one(document)
    print(f"✅ Inserted mindmap with ID: {new_id}")

    process_mindmap.delay(new_id)
    return {"success": True, "id": new_id}

@api_router.get("/mindmap/{id}/test_process")
async def test_process_mindmap(id: int):
    mindmap = dashboard_collection.find_one({"id": id})
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    
    topic_list = [item for item in mindmap.get("topic", [])]

    regex_or_conditions = [{"topic": {"$regex": f"^{topic}$", "$options": "i"}} for topic in topic_list]

    query = {
        "$and": [
            {"ticker": mindmap.get("ticker")},
            {"$or": regex_or_conditions}
        ]
    }
    articles = list(stock_sentiment_collection.find(query))
    data = build_mindmap_base(mindmap,articles)
    data['id'] = id
    if not process_collection.find_one({"id": id}): 
        process_collection.insert_one(data)
        dashboard_collection.update_one({"id": id}, {"$set": {"status": "done"}})

    return data

@api_router.get("/status")
async def get_status(id: int):
    mindmap = dashboard_collection.find_one({"id": id})

    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")

    current_status = mindmap.get("status", "pending")

    return {"id": id, "status": current_status}

@api_router.get("/mindmaps")
async def list_mindmaps():
    """
    Fetch and return all mindmaps.
    """
    mindmaps = list(dashboard_collection.find({}, {"_id": 0}))
    return mindmaps

@api_router.delete("/mindmap/{id}")
async def delete_mindmap(id: int):
    result = dashboard_collection.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    result = process_collection.delete_one({"id": id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Mindmap not found in process collection")
    print(f"🗑️ Deleted mindmap with ID: {id}")
    return {"success": True, "id": id}

@api_router.get("/mindmap/{id}")
async def get_mindmap(id: int):
    mindmap = process_collection.find_one({"id": id}, {"_id": 0})
    if not mindmap:
        raise HTTPException(status_code=404, detail="Mindmap not found")
    return mindmap

@app.get("/api/node-details")
async def get_node_details(mindmap_id: Optional[int] = None, node_id: Optional[str] = None):
    if not mindmap_id or not node_id:
        return {"error": "mindmap_id and node_id are both required."}

    # First find the document with correct mindmap_id
    # print(f"mindmap data: {process_collection}")
    mindmap = process_collection.find_one({'id': mindmap_id},{"_id": 0})
    # print(f"mindmap data: {mindmap}")
    if not mindmap:
        return {"error": f"No mindmap found with id {mindmap_id}"}

    # Then find the correct node inside that mindmap
    node_info = next((node for node in mindmap.get("nodes", []) if node.get("id") == node_id), None)

    if not node_info:
        return {"error": f"No node found with id {node_id} in mindmap {mindmap_id}"}
    if node_info.get("data", {}) != {}:
        data = fetch_ohlc_data(mindmap["ticker"], node_info["data"]["time_published"])
    return {
        "mindmap_id": mindmap_id,
        "node_id": node_id,
        "details": node_info.get("data", {}),
        "OHLC": data.get("ohlc", {})
    }

app.include_router(api_router, prefix="/api")
