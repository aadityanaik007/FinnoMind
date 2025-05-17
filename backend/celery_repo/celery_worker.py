import os
from celery import Celery

# Get Redis URL from environment
redis_url = os.getenv("REDIS_URL", "redis://localhost:6379/0")

# Create Celery app
celery_app = Celery(
    "tasks",
    broker=redis_url,
    backend=redis_url
)

# 💡 Import all tasks here to register them with Celery

from . import task  # <-- this line is required!
