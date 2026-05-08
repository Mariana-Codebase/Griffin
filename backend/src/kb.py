# AttackKnowledgeBase — ChromaDB vector store of successful payloads indexed by target profile.
# Attackers query this at audit start to adapt payloads that worked against similar targets.

# TODO: implement AttackKB class
#   - query(target_profile: dict, n=5) -> list[dict]  — retrieve similar past payloads
#   - store(payload: str, result: AttackResult, target_profile: dict) — persist after success
