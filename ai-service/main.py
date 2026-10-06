from fastapi import FastAPI
from pydantic import BaseModel
from fastembed import TextEmbedding
import numpy as np

app = FastAPI(title="HireSense AI Matching Service", version="2.0.0")
MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"
model = TextEmbedding(model_name=MODEL_NAME)

SKILLS = [
    "python","javascript","typescript","react","node.js","express","mongodb",
    "docker","aws","pytorch","tensorflow","sql","git","fastapi","nlp",
    "computer vision","machine learning","deep learning","rest api","mern"
]

class MatchRequest(BaseModel):
    resume_text: str
    job_description: str

def skill_set(text: str):
    t = text.lower()
    return sorted({s for s in SKILLS if s in t})

def embed(texts):
    return np.asarray(list(model.embed(texts)), dtype=np.float32)

@app.get("/health")
def health():
    return {"status": "ok", "model": MODEL_NAME, "runtime": "FastEmbed/ONNX"}

@app.post("/match")
def match(req: MatchRequest):
    vectors = embed([req.resume_text, req.job_description])
    a, b = vectors[0], vectors[1]
    semantic = float(np.dot(a, b) / ((np.linalg.norm(a) * np.linalg.norm(b)) + 1e-9))

    rskills = set(skill_set(req.resume_text))
    jskills = set(skill_set(req.job_description))
    overlap = sorted(rskills & jskills)
    missing = sorted(jskills - rskills)
    skill_score = len(overlap) / max(1, len(jskills))

    score = round(100 * (0.72 * max(0.0, semantic) + 0.28 * skill_score), 1)
    rationale = []
    if overlap:
        rationale.append(f"Strong overlap in {', '.join(overlap[:5])}.")
    if missing:
        rationale.append(f"Potential gap: {', '.join(missing[:4])}.")
    rationale.append(
        f"Semantic alignment: {semantic:.2f}; explicit skill coverage: {skill_score:.2f}."
    )

    return {
        "score": score,
        "semantic_similarity": round(semantic, 3),
        "skill_coverage": round(skill_score, 3),
        "matched_skills": overlap,
        "missing_skills": missing,
        "explanation": rationale,
    }
