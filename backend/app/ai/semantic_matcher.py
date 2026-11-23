"""Semantic matching with an optional local Sentence Transformers model.

The application remains usable without downloading a model: a transparent token
similarity fallback is used and the response identifies the method used.
"""
import re
from functools import lru_cache
from typing import Iterable

MODEL_NAME = "sentence-transformers/all-MiniLM-L6-v2"

@lru_cache(maxsize=1)
def _model():
    try:
        from sentence_transformers import SentenceTransformer
        return SentenceTransformer(MODEL_NAME, local_files_only=True)
    except Exception:
        return None

def _tokens(text: str) -> set[str]:
    return set(re.findall(r"[a-zA-Z][a-zA-Z0-9+#.]{1,}", (text or "").lower()))

def similarity(left: str, right: str) -> tuple[float, str]:
    model = _model()
    if model is not None:
        try:
            from sentence_transformers import util
            a, b = model.encode([left, right], normalize_embeddings=True)
            return max(0.0, float(util.cos_sim(a, b).item())), "sentence-transformers"
        except Exception:
            pass
    a, b = _tokens(left), _tokens(right)
    if not a or not b:
        return 0.0, "token-overlap-fallback"
    # Dice coefficient: interpretable lexical baseline, not an AI probability.
    return 2 * len(a & b) / (len(a) + len(b)), "token-overlap-fallback"

def match_requirements(requirements: Iterable[str], resume_text: str, threshold: float = 0.22):
    results = []
    methods = set()
    # Compare against individual lines/sentences so long resumes do not dilute
    # the relevance of one short requirement across the entire document.
    segments = [part.strip() for part in re.split(r"[\n.!?;]+", resume_text or "") if part.strip()]
    if not segments:
        segments = [resume_text or ""]
    for requirement in requirements:
        candidates = [similarity(requirement, segment) for segment in segments]
        score, method = max(candidates, key=lambda pair: pair[0]) if candidates else (0.0, "token-overlap-fallback")
        methods.add(method)
        results.append({"requirement": requirement, "similarity": round(score, 3),
                        "matched": score >= threshold, "method": method})
    return results, ("sentence-transformers" if methods == {"sentence-transformers"} else "token-overlap-fallback")
