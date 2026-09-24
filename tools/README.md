# FLOP agent-storage cost fixture

An independent, offline arithmetic tool for the [FLOP Yellow Paper §5.4 at commit `3c97bbc8d6ba68cf2ea003ab88bc154aafdf105e`](https://github.com/flop-labs/yellowpaper/blob/3c97bbc8d6ba68cf2ea003ab88bc154aafdf105e/yellowpaper.md). Reviewed 2026-09-24. Confidence: high in the draft text; paid-storage deployment unverified. The specification marks paid storage **PLANNED; ACTIVATION BLOCKED by E.54/E.47**.

This fixture is **DRAFT / ACTIVATION BLOCKED / NOT A LIVE QUOTE**. It does no network calls, signing, wallet work, pricing discovery, or settlement. It is not an official FLOP Labs tool.

Run from this repository’s root with Python 3.10+: `python tools/storage_cost.py tools/storage-cost-example.json` and `python -m unittest discover -s tools -p test_storage_cost.py -v`.

All money values are integer base units (10^-18 FLOP). Inputs are one shared tariff, a positive reservation term in blocks, and per-provider cumulative counters. The caller must supply reserved and served **encoded** bytes, including coding and padding. `chain_fees` is a separately supplied estimate. The calculator applies `ceil(c_i*T*p/q)` and `ceil(B_i*r/s)` once per provider, and charges `W_i*F + N_i*f`. It rejects unknown fixture profiles or specification commits and malformed inputs.

The sample isolates the Yellow Paper’s write-batching illustration: 20 writes on six providers at an illustrative 0.002 FLOP per provider per write yields 0.24 FLOP. Changing each provider’s `activated_writes` to 1,000 yields 12 FLOP. Its zero rent, retrieval, request and chain fees are intentionally excluded from this narrow comparison; they are not a complete storage quote. Other Yellow Paper scenario totals omit enough input detail that they cannot be reconstructed exactly from the published text.

The draft proposes one protocol epoch tariff, rather than independent provider price quotes. The E.54 profile must still fix launch rates, canonical formats and cross-language vectors. Do not use this fixture to create live storage messages or to claim a FLOP testnet/storage service is available.
