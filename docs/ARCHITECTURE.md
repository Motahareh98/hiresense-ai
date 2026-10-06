# Architecture Notes

HireSense deliberately separates product concerns from model inference. Express owns business workflows and persistence; FastAPI owns model lifecycle and inference. This makes independent scaling, model versioning and A/B testing straightforward.

## Scoring
`final = 0.72 * semantic_similarity + 0.28 * explicit_skill_coverage`

This is intentionally transparent: a recruiter can inspect both the semantic signal and matched/missing skills rather than receiving a single unexplained number.
