"""Offline arithmetic fixture for Yellow Paper §5.4 at commit 3c97bbc.

This is an explanatory calculator, not a quote, wallet, or wire implementation.
All monetary inputs and results are integer 10^-18 FLOP base units.
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from pathlib import Path


SPEC_COMMIT = "3c97bbc8d6ba68cf2ea003ab88bc154aafdf105e"
SOURCE = f"https://github.com/flop-labs/yellowpaper/blob/{SPEC_COMMIT}/yellowpaper.md"
STATUS = "DRAFT / ACTIVATION BLOCKED / NOT A LIVE QUOTE"
BASE_UNITS_PER_FLOP = 10**18
FIXTURE_PROFILE = "yellowpaper-3c97bbc-offline-v1"


def _integer(value: object, name: str, *, positive: bool = False) -> int:
    if isinstance(value, bool) or not isinstance(value, int):
        raise ValueError(f"{name} must be an integer")
    if value < (1 if positive else 0):
        raise ValueError(f"{name} must be {'positive' if positive else 'nonnegative'}")
    return value


def _ceil_div(numerator: int, denominator: int) -> int:
    return (numerator + denominator - 1) // denominator


@dataclass(frozen=True)
class Tariff:
    rent_numerator: int
    rent_denominator: int
    setup_fee: int
    retrieval_numerator: int
    retrieval_denominator: int
    request_fee: int

    def __post_init__(self) -> None:
        for name in ("rent_numerator", "setup_fee", "retrieval_numerator", "request_fee"):
            _integer(getattr(self, name), name)
        for name in ("rent_denominator", "retrieval_denominator"):
            _integer(getattr(self, name), name, positive=True)


@dataclass(frozen=True)
class ProviderUse:
    reserved_encoded_bytes: int
    activated_writes: int
    acknowledged_encoded_bytes: int
    acknowledged_requests: int

    def __post_init__(self) -> None:
        for name, value in asdict(self).items():
            _integer(value, name)


@dataclass(frozen=True)
class Estimate:
    rent: int
    setup: int
    retrieval: int
    requests: int
    chain_fees: int
    total: int

    def to_json(self) -> dict[str, object]:
        result: dict[str, object] = {
            "status": STATUS,
            "spec_commit": SPEC_COMMIT,
            "source": SOURCE,
            "unit": "10^-18 FLOP",
            "components_base_units": asdict(self),
        }
        result["components_flop"] = {
            key: f"{value // BASE_UNITS_PER_FLOP}.{value % BASE_UNITS_PER_FLOP:018d}".rstrip("0").rstrip(".")
            for key, value in asdict(self).items()
        }
        return result


def estimate(tariff: Tariff, providers: list[ProviderUse], term_blocks: int,
             chain_fees: int = 0) -> Estimate:
    """Apply R5.4e/R5.4g cumulative rounding once per provider.

    Provider byte counters must already include coding/encryption padding. A
    repeated read with a fresh request must be included again by the caller.
    Chain fees are an explicit external estimate, not a protocol tariff.
    """
    _integer(term_blocks, "term_blocks", positive=True)
    _integer(chain_fees, "chain_fees")
    if not providers:
        raise ValueError("at least one provider is required")
    rent = sum(_ceil_div(p.reserved_encoded_bytes * term_blocks * tariff.rent_numerator,
                        tariff.rent_denominator) for p in providers)
    setup = sum(p.activated_writes * tariff.setup_fee for p in providers)
    retrieval = sum(_ceil_div(p.acknowledged_encoded_bytes * tariff.retrieval_numerator,
                              tariff.retrieval_denominator) for p in providers)
    requests = sum(p.acknowledged_requests * tariff.request_fee for p in providers)
    return Estimate(rent, setup, retrieval, requests, chain_fees,
                    rent + setup + retrieval + requests + chain_fees)


def from_document(document: dict[str, object]) -> Estimate:
    if document.get("profile") != FIXTURE_PROFILE or document.get("spec_commit") != SPEC_COMMIT:
        raise ValueError("unknown profile or specification commit")
    if set(document) != {"profile", "spec_commit", "tariff", "providers", "term_blocks", "chain_fees"}:
        raise ValueError("unexpected or missing top-level fields")
    tariff_data = document["tariff"]
    provider_data = document["providers"]
    if not isinstance(tariff_data, dict) or set(tariff_data) != set(Tariff.__dataclass_fields__):
        raise ValueError("invalid tariff fields")
    if not isinstance(provider_data, list):
        raise ValueError("providers must be a list")
    providers: list[ProviderUse] = []
    for item in provider_data:
        if not isinstance(item, dict) or set(item) != set(ProviderUse.__dataclass_fields__):
            raise ValueError("invalid provider fields")
        providers.append(ProviderUse(**item))
    return estimate(Tariff(**tariff_data), providers, document["term_blocks"], document["chain_fees"])


def main() -> None:
    parser = argparse.ArgumentParser(description=STATUS)
    parser.add_argument("input", type=Path, help="offline JSON scenario")
    args = parser.parse_args()
    document = json.loads(args.input.read_text(encoding="utf-8"))
    if not isinstance(document, dict):
        parser.error("scenario must be a JSON object")
    try:
        result = from_document(document)
    except (TypeError, ValueError) as error:
        parser.error(str(error))
    print(json.dumps(result.to_json(), indent=2))


if __name__ == "__main__":
    main()
