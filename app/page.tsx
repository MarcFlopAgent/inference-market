'use client';

import { useEffect, useMemo, useState } from 'react';
import type { MarketResponse, ProviderSnapshot } from '../lib/market/types';

const initialProviders: ProviderSnapshot[] = [
  {
    id: 'chutes', name: 'Chutes', subnet: 'SN64', status: 'Verified snapshot', integration: 'available', enabled: true,
    sourceUrl: 'https://chutes.ai/pricing', retrievedAt: '2026-08-30T00:00:00.000Z', confidence: 'high',
    note: 'Live refresh pending.', quotes: [{ product: 'Qwen3-32B TEE', billingUnit: 'tokens', inputUsdPerMillion: 0.104, outputUsdPerMillion: 0.416, qualifier: '2026-08-30 verified snapshot' }],
  },
  {
    id: 'nineteen', name: 'Nineteen', subnet: 'SN19', status: 'Qualified headline', integration: 'watch', enabled: false,
    sourceUrl: 'https://nineteen.ai/', retrievedAt: '2026-08-30T00:00:00.000Z', confidence: 'medium',
    note: 'Verify current billing in-account before routing.', quotes: [{ product: 'Provider landing-page headline', billingUnit: 'tokens', blendedUsdPerMillion: 0, qualifier: 'Asterisked “currently” headline' }],
  },
  {
    id: 'green-compute', name: 'Green Compute', subnet: 'SN110', status: 'Verified snapshot', integration: 'available', enabled: true,
    sourceUrl: 'https://www.green-compute.com/', retrievedAt: '2026-08-30T00:00:00.000Z', confidence: 'high',
    note: 'Indicative starting rate.', quotes: [{ product: 'RTX 4090', billingUnit: 'gpu-hour', usdPerGpuHour: 0.4, qualifier: 'Indicative starting rate' }],
  },
  {
    id: 'instant', name: 'Instant', subnet: 'SN46', status: 'Integration watch', integration: 'watch', enabled: false,
    sourceUrl: 'https://docs.instantsubnet.com/about/', retrievedAt: '2026-08-30T00:00:00.000Z', confidence: 'high',
    note: 'Public customer price not published.', quotes: [{ product: 'OpenAI-compatible inference', billingUnit: 'unpublished', qualifier: 'Public price not published' }],
  },
  {
    id: 'flop', name: 'FLOP', subnet: 'Testnet target Q4 2026', status: 'Adapter ready—not connected', integration: 'planned', enabled: false,
    sourceUrl: 'https://flop.finance/teaser/', retrievedAt: '2026-08-30T00:00:00.000Z', confidence: 'high',
    note: 'Fail-closed until the official interface is released.', quotes: [{ product: 'Official testnet inference', billingUnit: 'planned', qualifier: 'Interface not released' }],
  },
];

function quoteLabel(provider: ProviderSnapshot) {
  const quote = provider.quotes[0];
  if (!quote) return 'No quote';
  if (typeof quote.inputUsdPerMillion === 'number' && typeof quote.outputUsdPerMillion === 'number') {
    return `$${quote.inputUsdPerMillion} in · $${quote.outputUsdPerMillion} out`;
  }
  if (typeof quote.blendedUsdPerMillion === 'number') return `$${quote.blendedUsdPerMillion.toFixed(2)} / 1M tokens*`;
  if (typeof quote.usdPerGpuHour === 'number') return `From $${quote.usdPerGpuHour.toFixed(2)} / GPU hr`;
  return quote.billingUnit === 'planned' ? 'Not available yet' : 'Not published';
}

function unitLabel(provider: ProviderSnapshot) {
  const unit = provider.quotes[0]?.billingUnit;
  if (unit === 'tokens') return 'Per 1M tokens';
  if (unit === 'gpu-hour') return 'GPU rental';
  if (unit === 'planned') return 'Testnet price';
  return 'Public customer price';
}

export default function Home() {
  const [inputTokens, setInputTokens] = useState(80000);
  const [outputTokens, setOutputTokens] = useState(12000);
  const [market, setMarket] = useState<MarketResponse>({
    generatedAt: '2026-08-30T00:00:00.000Z',
    providers: initialProviders,
    policy: { walletConnected: false, credentialsStored: false, inferenceEnabled: false },
  });
  const [refreshState, setRefreshState] = useState('Verified snapshot');

  useEffect(() => {
    let active = true;
    fetch('/api/market')
      .then((response) => {
        if (!response.ok) throw new Error('Market refresh failed');
        return response.json() as Promise<MarketResponse>;
      })
      .then((payload) => {
        if (active) {
          setMarket(payload);
          setRefreshState('Live source refresh');
        }
      })
      .catch(() => active && setRefreshState('Verified snapshot'));
    return () => { active = false; };
  }, []);

  const chutesQuote = market.providers.find((provider) => provider.id === 'chutes')?.quotes.find((quote) => quote.billingUnit === 'tokens');
  const chutesEstimate = useMemo(() => {
    const inputRate = chutesQuote?.inputUsdPerMillion ?? 0.104;
    const outputRate = chutesQuote?.outputUsdPerMillion ?? 0.416;
    return (inputTokens * inputRate + outputTokens * outputRate) / 1_000_000;
  }, [chutesQuote, inputTokens, outputTokens]);
  const pricedSurfaces = market.providers.filter((provider) =>
    provider.quotes.some((quote) => quote.billingUnit === 'tokens' || quote.billingUnit === 'gpu-hour'),
  ).length;

  return (
    <main>
      <nav className="topbar" aria-label="Primary navigation">
        <a className="brand" href="#top" aria-label="Inference Market home">
          <span className="brandMark">M</span>
          <span>Inference Market</span>
        </a>
        <div className="navMeta">
          <span className="pulse" aria-hidden="true" />
          <span>{refreshState}</span>
        </div>
      </nav>

      <section id="top" className="hero shell">
        <div>
          <p className="eyebrow">Bittensor now · FLOP next</p>
          <h1>Route inference with the evidence attached.</h1>
          <p className="lede">
            A neutral comparison surface for decentralized inference—pricing,
            availability, and source confidence in one auditable view.
          </p>
        </div>
        <div className="heroStamp">
          <span>Last source check</span>
          <strong>{new Date(market.generatedAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase()}</strong>
          <small>{refreshState}</small>
        </div>
      </section>

      <section className="shell statusStrip" aria-label="Market summary">
        <div><strong>{market.providers.length}</strong><span>adapters</span></div>
        <div><strong>{pricedSurfaces}</strong><span>priced surfaces</span></div>
        <div><strong>{market.policy.credentialsStored ? '1' : '0'}</strong><span>credentials stored</span></div>
        <div><strong>Q4</strong><span>FLOP testnet target</span></div>
      </section>

      <section className="shell sectionBlock">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Provider board</p>
            <h2>Current market signals</h2>
          </div>
          <p>Units are preserved as published; unlike units are never ranked as if equivalent.</p>
        </div>

        <div className="providerGrid">
          {market.providers.map((provider) => (
            <article className={`providerCard ${provider.integration}`} key={provider.id}>
              <div className="cardTop">
                <span className="subnet">{provider.subnet}</span>
                <span className="state">{provider.status}</span>
              </div>
              <h3>{provider.name}</h3>
              <p className="unit">{unitLabel(provider)}</p>
              <p className="price">{quoteLabel(provider)}</p>
              <p className="model">{provider.quotes[0]?.product} · {provider.confidence} confidence</p>
              <p className="caveat">{provider.quotes[0]?.qualifier}</p>
              <a href={provider.sourceUrl} target="_blank" rel="noreferrer">Official source ↗</a>
            </article>
          ))}
        </div>
      </section>

      <section className="shell calculator">
        <div>
          <p className="eyebrow">Route estimate</p>
          <h2>Price a representative workload</h2>
          <p className="calcCopy">
            The estimator uses the latest Chutes split-token quote. Active inference
            stays disabled until credentials are supplied through protected hosting
            configuration and an explicit spend cap is approved.
          </p>
          <div className="routeVerdict">
            <span>Current verifiable route</span>
            <strong>Chutes · Qwen3-32B TEE</strong>
            <small>Only reviewed adapter with split token pricing for this model.</small>
          </div>
        </div>
        <div className="controls">
          <label>
            <span>Input tokens</span>
            <input value={inputTokens} onChange={(event) => setInputTokens(Number(event.target.value))} type="number" min="0" step="1000" />
          </label>
          <label>
            <span>Output tokens</span>
            <input value={outputTokens} onChange={(event) => setOutputTokens(Number(event.target.value))} type="number" min="0" step="1000" />
          </label>
          <div className="estimate">
            <span>Estimated Chutes cost</span>
            <strong>${chutesEstimate.toFixed(4)}</strong>
            <small>Published rate · estimate only · no request sent</small>
          </div>
        </div>
      </section>

      <section className="shell benchmarkBlock">
        <div className="sectionHeading">
          <div>
            <p className="eyebrow">Benchmark contract</p>
            <h2>Useful activity, bounded by design.</h2>
          </div>
          <p>When credentials are authorized, each run records cost, latency, throughput, model identity, source time, and a redacted evidence digest.</p>
        </div>
        <div className="metricGrid">
          {[
            ['TTFT', 'Time to first token'],
            ['TOK/S', 'Output throughput'],
            ['USD', 'Observed total cost'],
            ['SHA-256', 'Redacted evidence digest'],
          ].map(([metric, label]) => (
            <div key={metric}><strong>{metric}</strong><span>{label}</span></div>
          ))}
        </div>
        <div className="guardrailRow">
          <span>Wallet connection <strong>off</strong></span>
          <span>Paid inference <strong>off</strong></span>
          <span>FLOP adapter <strong>fail-closed</strong></span>
        </div>
      </section>

      <footer className="shell footer">
        <span>Built by MarcFlopAgent</span>
        <span>Evidence first · no wallet connected</span>
      </footer>
    </main>
  );
}
