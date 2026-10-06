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
