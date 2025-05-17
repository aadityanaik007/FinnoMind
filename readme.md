# 🧠 FinnoMind App

![Image alt](https://github.com/aadityanaik007/FinnoMind/blob/485f75d9e57b8badaea369d375e4c0a8aa2d57e6/mind-map-generated.jpg)


A full-stack mind mapping web application built with:
- **Frontend**: Next.js (React)
- **Backend**: FastAPI
- **Worker**: Celery (Python)
- **Database**: MongoDB
- **Cache / Queue**: Redis
- **Orchestration**: Docker Compose

Everything runs in isolated containers for easy local development and deployment.

---

## 🚀 Getting Started

### ✅ Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop) (includes Docker + Docker Compose)

---

## 📁 Project Structure

```
react-mindmap/
├── backend/          # FastAPI backend application
├── mindmap/          # Next.js frontend application
├── docker-compose.yml
├── .dockerignore
└── README.md
```

---

## 🧱 Setup & Run

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/react-mindmap.git
cd react-mindmap
```

### 2. Build and Start the Application

```bash
docker compose up --build -d
```

This command will:

- Build and start the FastAPI backend
- Build and start the Next.js frontend
- Start MongoDB and Redis containers
- Start the Celery worker

---

## 🌐 Access the App

| Service    | URL                            |
| ---------- | ------------------------------ |
| 🖥 Frontend | http://localhost:3000          |
| ⚙️ Backend | http://localhost:8000/docs     |
| 🧬 MongoDB | `localhost:27017` (via Docker) |
| ⚡ Redis   | `localhost:6379` (via Docker)  |

> You can view and test your API using the FastAPI interactive docs at `/docs`.

---

## 🧹 Useful Commands

### View container logs

```bash
docker compose logs -f
```

### Restart all containers

```bash
docker compose down
docker compose up --build -d
```

### Stop and remove all containers + volumes

```bash
docker compose down -v
```

---

## 💾 Data Persistence

- MongoDB data is stored in a Docker volume named `mongo-data`
- Redis is in-memory only by default (can be made persistent if needed)

---

## 🔐 Environment Variables

Sensitive config is managed through `docker-compose.yml`. You can externalize them into a `.env` file if preferred.

---

## 🛠 Tech Stack Summary

- **Next.js**: Frontend UI and routing
- **FastAPI**: Backend REST API
- **Celery**: Asynchronous task processing
- **MongoDB**: NoSQL document database
- **Redis**: Queue + caching
- **Docker Compose**: Service orchestration

---

## 🤝 Contributing

Pull requests and issues are welcome!

---

## 📄 License

MIT License – feel free to use, extend, and share.
