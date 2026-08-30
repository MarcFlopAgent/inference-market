# Bittensor inference market source baseline

Date recorded: 2026-08-30  
Retrieval date: 2026-08-30  
Scope: Chutes (SN64), Nineteen (SN19), Green Compute (SN110), Instant (SN46), and the planned FLOP adapter.

## Product conclusion

An auditable comparison and routing dashboard is feasible now, but a defensible first version must preserve each provider's published billing unit and must not rank unlike products as though they were interchangeable. Chutes publishes model-token and GPU-hour rates. Green Compute publishes indicative GPU-hour starting rates. Nineteen publishes an operational API and a zero-price headline with an asterisk, but the public landing page does not provide enough current billing detail to treat that headline as a guaranteed route price. Instant documents its network architecture but does not publish customer pricing. FLOP has no released testnet interface or pricing API.

The implementation should therefore distinguish these states:

- `live`: structured or clearly published pricing is available.
- `headline`: a provider displays a price claim but its current terms or billing mechanics are incomplete.
- `unpublished`: the service exists but no public customer rate was found.
- `planned`: the adapter contract exists locally, but no network call is permitted until an official interface is released and reviewed.

## Source matrix

| Provider | Official evidence | Material observation | Confidence |
| --- | --- | --- | --- |
| Chutes (SN64) | [Pricing](https://chutes.ai/pricing), [pricing API](https://api.chutes.ai/pricing), [documentation](https://docs.chutes.ai/) | Public inference is billed per model token; the observed Qwen3-32B TEE rate was $0.104 input and $0.416 output per 1M tokens. The public API also returned live GPU-hour estimates. | High |
| Nineteen (SN19) | [Nineteen](https://nineteen.ai/), [application status](https://app.sn19.ai/app), [subnet repository](https://github.com/sirouk/nineteen) | The application reported the platform/API operational. The landing page displayed a “currently” $0.00 per 1M-token headline, while also announcing that payments are live; no sufficiently detailed public billing schedule was found. Treat the zero price as a qualified headline, not a guaranteed route rate. | Medium |
| Green Compute (SN110) | [Green Compute](https://www.green-compute.com/) | The official site published indicative starting rates of $0.40/GPU-hour for RTX 4090 and $0.70/GPU-hour for RTX 5090, with final provider prices updating in its rental dashboard. | High for the starting rates; medium for any specific live quote not retrieved from the authenticated marketplace |
| Instant (SN46) | [Instant documentation](https://docs.instantsubnet.com/about/) | Instant describes an OpenAI-compatible inference network with gateway, outbound miners, signed receipts, validators, and TOPLOC evidence. No public customer price was found. | High for architecture; high that pricing remains unavailable from the reviewed public material |
| FLOP | [FLOP home](https://flop.finance/), [teaser v0.1](https://flop.finance/teaser/) | The provisional teaser targets testnet for Q4 2026. Agents are intended to create session requests and spend test tokens on inference, but no testnet endpoint, schema, chain identifier, faucet procedure, model catalog, or pricing API is published. | High; official draft, explicitly provisional |

## FLOP connection gate

The FLOP adapter must remain disabled until all of the following are available from an official FLOP source and pass review:

1. Testnet chain and endpoint identifiers.
2. Session-request and response schemas.
3. Model identifiers and price/fee representation.
4. Faucet and agent-registration procedure.
5. Authentication/signing specification and replay protection.
6. Official test vectors or a conformance suite.
7. Clear secret-storage and spending-limit requirements.

No faucet, wallet, signed request, test-token claim, or live inference action is authorized by this document.

## Benchmarking boundary

The public dashboard may display source-backed pricing without credentials. Active benchmarks require provider credentials stored outside Git and chat, a small explicit spend cap, a fixed prompt suite, recorded model/version identifiers, latency and token-count capture, and redacted evidence output. Benchmarks must measure useful inference and may not generate traffic solely to inflate eligibility metrics.

## Technocore boundary

[Technocore](https://technocore.chat/humans) is a public unauthenticated chat service and states that messages are world-readable and non-durable. It also describes itself as a satellite service rather than part of the FLOP protocol. A future post should link to the durable repository and dashboard, disclose that the FLOP adapter is disabled, request technical feedback, and never include credentials or eligibility claims.
