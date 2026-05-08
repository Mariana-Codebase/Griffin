# Publishes threat intelligence to Solana devnet via the Memo Program.
# No custom Anchor program — intentional. Memo Program scales to millions of events.
#
# Memo format (published as UTF-8 string in tx memo):
# {"type":"PG_THREAT","v":1,"hash":"<sha256>","vector":"<attack_type>",
#  "severity":"critical","cvss":9.1,"target_profile":{...},"ts":1730000000}

# TODO: implement publish_threat(payload: str, vector: str, severity: str, cvss: float, target_profile: dict) -> str
#   - sha256 the payload
#   - build memo instruction with JSON
#   - sign with attacker wallet (loaded from ATTACKER_WALLET_PATH env var)
#   - send to devnet
#   - return tx_hash
