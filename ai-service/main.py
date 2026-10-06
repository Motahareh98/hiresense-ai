from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
import numpy as np, re

app=FastAPI(title="HireSense AI Matching Service", version="1.0.0")
model=SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
SKILLS=["python","javascript","typescript","react","node.js","express","mongodb","docker","aws","pytorch","tensorflow","sql","git","fastapi","nlp","computer vision","machine learning","deep learning","rest api","mern"]

class MatchRequest(BaseModel):
    resume_text:str
    job_description:str

def skill_set(text):
    t=text.lower()
    return sorted({s for s in SKILLS if s in t})

@app.get('/health')
def health(): return {"status":"ok","model":"all-MiniLM-L6-v2"}

@app.post('/match')
def match(req:MatchRequest):
    emb=model.encode([req.resume_text, req.job_description], normalize_embeddings=True)
    semantic=float(np.dot(emb[0],emb[1]))
    rskills=set(skill_set(req.resume_text)); jskills=set(skill_set(req.job_description))
    overlap=sorted(rskills & jskills); missing=sorted(jskills-rskills)
    skill_score=(len(overlap)/max(1,len(jskills)))
    score=round(100*(0.72*max(0,semantic)+0.28*skill_score),1)
    rationale=[]
    if overlap: rationale.append(f"Strong overlap in {', '.join(overlap[:5])}.")
    if missing: rationale.append(f"Potential gap: {', '.join(missing[:4])}.")
    rationale.append(f"Semantic alignment: {semantic:.2f}; explicit skill coverage: {skill_score:.2f}.")
    return {"score":score,"semantic_similarity":round(semantic,3),"skill_coverage":round(skill_score,3),"matched_skills":overlap,"missing_skills":missing,"explanation":rationale}
