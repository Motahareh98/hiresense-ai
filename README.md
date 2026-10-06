# HireSense AI — Explainable AI Recruitment Platform

A production-style **AI + MERN** portfolio project that ranks candidates against job descriptions using transformer embeddings and explicit skill coverage, then explains *why* a candidate matched.

## Why this project is strong
- MERN product surface: React dashboard, Express API, MongoDB persistence.
- Real AI inference: `sentence-transformers/all-MiniLM-L6-v2` semantic embeddings.
- Explainability: semantic score + explicit skill coverage + missing-skill analysis.
- Recruiter workflow: saved candidate history and ranking-ready API.
- Reproducible deployment: Docker Compose runs Mongo, AI service, API and web app.

## Architecture
```text
React/Vite → Express API → MongoDB
                   ↘ FastAPI AI service → Sentence Transformer
```

## Run
```bash
docker compose up --build
```
Open `http://localhost:4173`.

## API highlights
- `POST /api/candidates/analyze` — persist candidate + AI analysis
- `GET /api/candidates` — recent analyses
- `GET /api/dashboard` — aggregate recruiting metrics
- AI `POST /match` — semantic + skill match engine

## Interview talking points
Discuss model choice, normalized embeddings/cosine similarity, explainability, service separation, error handling, Mongo schema design and how you would add vector search, audit logs, RBAC and bias monitoring.


## Run locally without Docker (Windows)

You only need **Python 3.11+** and **Node.js 20+**. MongoDB is optional: if `MONGO_URI` is not configured, the app automatically switches to an in-memory demo store.

The easiest option is:

```bat
start-local.bat
```

The script will:
1. create a Python virtual environment for the AI service,
2. install Python dependencies,
3. start FastAPI on port 8000,
4. install/build the React client,
5. install/start the Node/Express app,
6. open http://localhost:5000.

> First launch can take longer because the AI model is downloaded once.

## Deploy online

A `render.yaml` Blueprint is included for Render. It defines:
- one Python AI web service,
- one Node/Express public web service that also serves the built React frontend,
- private service-to-service AI networking,
- no mandatory database dependency.

MongoDB remains optional. Set `MONGO_URI` later if persistent storage is required.

### Render account note
Render may require billing information before creating new web services, even when the service configuration uses the free plan. Once the account is allowed to create web services, the repository is deployment-ready.
