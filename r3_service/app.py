"""
Model C — Tencent R3-Skill local skill router
=============================================
Runs Tencent's two-stage skill retriever entirely on this machine:

    user question --[R3-Embedding-0.6B]--> recall top-N skills
                  --[R3-Rerank-0.6B]----> rerank --> best dashboard skill

The Node AI server (server/index.js) calls POST /route, then sends only the
data that the winning skill needs to the local Ollama LLM.

Weights are downloaded ONCE from Hugging Face (see README). After that,
inference is 100% local; no cloud AI API is ever called.

Prompts and the "name | description | body" skill format are copied from
Tencent's official infer.py (https://github.com/Tencent/R3-Skill) and must not
be changed, because the models were trained with them.
"""
import json
import os
import time
from pathlib import Path

import numpy as np
import torch
from flask import Flask, jsonify, request
from sentence_transformers import CrossEncoder, SentenceTransformer

HERE = Path(__file__).resolve().parent
SKILLS_PATH = HERE.parent / "server" / "skills" / "dashboard_skills.json"
PORT = int(os.environ.get("R3_PORT", "5055"))

# Train/inference-consistent prompts from Tencent's infer.py (do NOT change)
EMB_INSTR = "Instruct: Given a user request, retrieve the agent skill that solves it.\nQuery: "
RR_INSTRUCT = "Given a user request, retrieve the agent skill that solves it."


def resolve_model(local_dir: Path, hub_id: str) -> str:
    """Use downloaded weights in r3_service/models/ if present, else the HF cache."""
    return str(local_dir) if local_dir.exists() else hub_id


EMB_PATH = resolve_model(HERE / "models" / "r3-embedding", "tencent/R3-embedding-0.6b")
RR_PATH = resolve_model(HERE / "models" / "r3-reranker", "tencent/R3-rerank-0.6b")

# Retrieval has no sampling, so it is deterministic by design; these just make
# the torch runtime itself reproducible on CPU.
torch.manual_seed(0)
torch.use_deterministic_algorithms(True, warn_only=True)

device = "cuda" if torch.cuda.is_available() else (
    "mps" if torch.backends.mps.is_available() else "cpu"
)

skills = json.loads(SKILLS_PATH.read_text(encoding="utf-8"))
skill_ids = [s["id"] for s in skills]
skill_docs = [f'{s["id"]} | {s["description"]} | {s["body"]}' for s in skills]

print(f"[R3] device={device}")
print(f"[R3] loading embedding model: {EMB_PATH}")
emb_model = SentenceTransformer(EMB_PATH, device=device)
emb_model.max_seq_length = 1024

print(f"[R3] loading reranker model: {RR_PATH}")
rr_model = CrossEncoder(RR_PATH, device=device)
rr_model.max_length = 1024

# Skill embeddings are computed once at startup and cached in memory
skill_emb = emb_model.encode(skill_docs, normalize_embeddings=True, convert_to_numpy=True)
print(f"[R3] indexed {len(skills)} dashboard skills")

app = Flask(__name__)


@app.get("/health")
def health():
    return jsonify({
        "status": "OK",
        "model": "Tencent R3-Skill (R3-Embedding-0.6B + R3-Rerank-0.6B)",
        "device": device,
        "skills": len(skills),
    })


@app.post("/route")
def route():
    body = request.get_json(force=True) or {}
    query = (body.get("query") or "").strip()
    if not query:
        return jsonify({"error": "Missing query"}), 400

    recall_n = min(int(body.get("recall_n", 6)), len(skills))
    top_k = min(int(body.get("top_k", 3)), recall_n)

    t0 = time.perf_counter()

    # Stage 1: bi-encoder recall (cosine similarity on normalised vectors)
    q_emb = emb_model.encode([EMB_INSTR + query], normalize_embeddings=True, convert_to_numpy=True)
    emb_scores = (q_emb @ skill_emb.T)[0]
    recall_idx = np.argsort(-emb_scores)[:recall_n]
    t1 = time.perf_counter()

    # Stage 2: cross-encoder rerank of the recalled candidates
    pairs = [(query, skill_docs[j]) for j in recall_idx]
    rr_scores = rr_model.predict(pairs, prompt=RR_INSTRUCT, convert_to_numpy=True)
    order = np.argsort(-rr_scores)[:top_k]
    t2 = time.perf_counter()

    results = [
        {
            "id": skill_ids[recall_idx[o]],
            "rerank_score": round(float(rr_scores[o]), 4),
            "embedding_score": round(float(emb_scores[recall_idx[o]]), 4),
        }
        for o in order
    ]

    return jsonify({
        "query": query,
        "results": results,
        "timings_ms": {
            "embedding": round((t1 - t0) * 1000, 1),
            "rerank": round((t2 - t1) * 1000, 1),
        },
    })


if __name__ == "__main__":
    print(f"[R3] Tencent R3-Skill router running on http://localhost:{PORT}")
    app.run(host="127.0.0.1", port=PORT, debug=False)
