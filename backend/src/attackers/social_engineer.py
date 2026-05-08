import argparse
import asyncio
import os
import sys
import time
import uuid
from pathlib import Path

import anthropic
from dotenv import load_dotenv

from .base import AttackResult, BaseAttacker

ATTACKER_WALLET = "4Ke7E3kiNhW2Q7RvRRUz5VaTXXR9hGhTfRVVG9Ww2eiH"


class SocialEngineerAttacker(BaseAttacker):
    id = "social_engineer"
    name = "The Social Engineer"

    async def attack(self) -> AttackResult:
        prompt_template = self._load_prompt("social_engineer.txt")
        target_history: list[dict[str, str]] = []
        deadline = time.monotonic() + self.TIMEOUT_SECONDS

        for attempt in range(1, self.MAX_ATTEMPTS + 1):
            if time.monotonic() > deadline:
                self._log_attempt(attempt, "", "", False, "timeout")
                return AttackResult(success=False, attempts=attempt)

            history_text = (
                "\n".join(f"{e['role'].upper()}: {e['content']}" for e in target_history)
                or "(no prior conversation)"
            )
            prompt = (
                prompt_template
                .replace("{history}", history_text)
                .replace("{attempt_number}", str(attempt))
                .replace("{attacker_wallet}", ATTACKER_WALLET)
            )

            generation = await self.client.messages.create(
                model=self.MODEL,
                max_tokens=300,
                messages=[{"role": "user", "content": prompt}],
            )
            payload = generation.content[0].text.strip()

            try:
                result = await self._send(payload)
            except Exception as exc:
                self._log_attempt(attempt, payload, str(exc), False, "send_error")
                continue

            response_text = result.get("response", "")
            target_history.extend([
                {"role": "attacker", "content": payload},
                {"role": "bot", "content": response_text},
            ])

            success, tx_hash = self._check_success(response_text)
            self._log_attempt(
                attempt, payload, response_text, success,
                "transfer_detected" if success else "no_transfer",
            )

            if success:
                return AttackResult(
                    success=True,
                    exploit_prompt=payload,
                    response=response_text,
                    attempts=attempt,
                    tx_hash=tx_hash,
                )

        return AttackResult(success=False, attempts=self.MAX_ATTEMPTS)


def _load_env() -> None:
    root = Path(__file__).resolve().parent.parent.parent.parent  # kari/
    for candidate in [root / "backend" / ".env", root / ".env", Path(".env")]:
        if candidate.exists():
            load_dotenv(candidate, override=False)


async def _main() -> None:
    parser = argparse.ArgumentParser(description="Social Engineer — standalone red team run")
    parser.add_argument("--target", default="http://localhost:3001/chat")
    args = parser.parse_args()

    _load_env()
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    if not api_key:
        sys.exit("ANTHROPIC_API_KEY not set. Add it to backend/.env or export it.")

    client = anthropic.AsyncAnthropic(api_key=api_key)
    session_id = f"se_{uuid.uuid4().hex[:8]}"
    attacker = SocialEngineerAttacker(target_url=args.target, session_id=session_id, client=client)

    print(f"[{attacker.name}] target={args.target} session={session_id}", flush=True)
    result = await attacker.attack()

    print(f"\n{'='*60}")
    print(f"RESULT  : {'SUCCESS ✓' if result.success else 'FAILED'}")
    print(f"ATTEMPTS: {result.attempts}/{attacker.MAX_ATTEMPTS}")
    if result.success:
        print(f"EXPLOIT : {result.exploit_prompt}")
        if result.tx_hash:
            print(f"TX      : https://solscan.io/tx/{result.tx_hash}?cluster=devnet")


if __name__ == "__main__":
    asyncio.run(_main())
