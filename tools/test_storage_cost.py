"""Exact arithmetic and rejection tests for the offline storage fixture."""

import json
import unittest

from storage_cost import (
    BASE_UNITS_PER_FLOP, FIXTURE_PROFILE, SPEC_COMMIT, ProviderUse, Tariff,
    estimate, from_document,
)


class StorageCostTests(unittest.TestCase):
    def setUp(self) -> None:
        self.setup_fee = 2_000_000_000_000_000  # illustrative 0.002 FLOP
        self.tariff = Tariff(0, 1, self.setup_fee, 0, 1, 0)

    def test_published_write_batching_illustration(self) -> None:
        per_turn = estimate(self.tariff, [ProviderUse(0, 1000, 0, 0)] * 6, 1)
        batched = estimate(self.tariff, [ProviderUse(0, 20, 0, 0)] * 6, 1)
        self.assertEqual(per_turn.setup, 12 * BASE_UNITS_PER_FLOP)
        self.assertEqual(batched.setup, 240_000_000_000_000_000)
        self.assertEqual(per_turn.total // batched.total, 50)

    def test_cumulative_provider_rounding_and_components(self) -> None:
        tariff = Tariff(1, 3, 7, 1, 3, 5)
        providers = [ProviderUse(1, 2, 1, 3), ProviderUse(1, 1, 2, 1)]
        result = estimate(tariff, providers, 1, chain_fees=11)
        self.assertEqual((result.rent, result.setup, result.retrieval,
                          result.requests, result.chain_fees, result.total),
                         (2, 21, 2, 20, 11, 56))

    def test_accumulated_bytes_round_once_per_provider(self) -> None:
        tariff = Tariff(0, 1, 0, 1, 3, 0)
        result = estimate(tariff, [ProviderUse(0, 0, 3, 2)], 1)
        self.assertEqual(result.retrieval, 1)

    def test_rejects_unknown_profile_commit_and_invalid_counters(self) -> None:
        template = {"profile": FIXTURE_PROFILE, "spec_commit": SPEC_COMMIT,
                    "tariff": {"rent_numerator": 0, "rent_denominator": 1,
                               "setup_fee": 0, "retrieval_numerator": 0,
                               "retrieval_denominator": 1, "request_fee": 0},
                    "providers": [{"reserved_encoded_bytes": 0, "activated_writes": 0,
                                   "acknowledged_encoded_bytes": 0,
                                   "acknowledged_requests": 0}],
                    "term_blocks": 1, "chain_fees": 0}
        self.assertEqual(from_document(template).total, 0)
        for field, value in (("profile", "new-profile"), ("spec_commit", "new-commit")):
            bad = json.loads(json.dumps(template)); bad[field] = value
            with self.assertRaises(ValueError):
                from_document(bad)
        bad = json.loads(json.dumps(template)); bad["providers"][0]["activated_writes"] = -1
        with self.assertRaises(ValueError):
            from_document(bad)
        bad = json.loads(json.dumps(template)); bad["tariff"]["rent_denominator"] = 0
        with self.assertRaises(ValueError):
            from_document(bad)
        bad = json.loads(json.dumps(template)); bad["chain_fees"] = True
        with self.assertRaises(ValueError):
            from_document(bad)


if __name__ == "__main__":
    unittest.main()
