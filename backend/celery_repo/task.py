from celery_repo.celery_worker import celery_app
from pymongo import MongoClient
import os
from build.mind_map_creation import build_mindmap_base

MONGO_URI = os.getenv("MONGO_URI", "mongodb://root:example@localhost:27017/")
client = MongoClient(MONGO_URI)

db = client["User"]
dashboard_collection = db["Dashboard"]
process_collection = db["Process"]
db_sent_client = client["stock_sentiment"]
stock_sentiment_collection = db_sent_client["articles"]

client = MongoClient(MONGO_URI)
db = client["User"]
dashboard_collection = db["Dashboard"]

@celery_app.task(name="tasks.process_mindmap")
def process_mindmap(id):
    mindmap = dashboard_collection.find_one({"id": id})

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
    data['ticker'] = mindmap.get("ticker","")
    if not process_collection.find_one({"id": id}): 
        process_collection.insert_one(data)
        dashboard_collection.update_one({"id": id}, {"$set": {"status": "done"}})

    return data