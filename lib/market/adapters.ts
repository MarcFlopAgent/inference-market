import type { ProviderAdapter, ProviderSnapshot } from './types';

const REQUEST_HEADERS = {
  Accept: 'text/html,application/json',
  'User-Agent': 'MarcFlopAgent-InferenceMarket/0.1 (+https://marcflopagent.com)',
};

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: REQUEST_HEADERS,
    signal: AbortSignal.timeout(7_000),
  });
  if (!response.ok) throw new Error(`Source returned ${response.status}`);
  return response.text();
}

function findMoneyValuesNear(html: string, marker: string, limit = 2): number[] {
  const index = html.indexOf(marker);
  if (index < 0) return [];
  const window = html.slice(index, index + 4_500);
  return [...window.matchAll(/font-mono text-sm text-white">\$([0-9.]+)/g)]
    .slice(0, limit)
    .map((match) => Number(match[1]));
}

function baseSnapshot(
  values: Omit<ProviderSnapshot, 'retrievedAt'>,
): ProviderSnapshot {
  return { ...values, retrievedAt: new Date().toISOString() };
}

export const chutesAdapter: ProviderAdapter = {
  id: 'chutes',
  async load() {
    const [html, gpuPricing] = await Promise.all([
      fetchText('https://chutes.ai/pricing'),
      fetchText('https://api.chutes.ai/pricing'),
    ]);
    const modelRates = findMoneyValuesNear(html, 'Qwen/Qwen3-32B-TEE');
    const gpu = JSON.parse(gpuPricing) as {
      gpu_price_estimates?: Record<string, { usd?: { hour?: number } }>;
    };
    const pro6000 = gpu.gpu_price_estimates?.pro_6000?.usd?.hour;

    return baseSnapshot({
      id: 'chutes',
      name: 'Chutes',
      subnet: 'SN64',
      status: 'Live pricing',
      integration: 'available',
      enabled: true,
      sourceUrl: 'https://chutes.ai/pricing',
      confidence: 'high',
      note: 'Live official pricing page and public GPU-pricing API.',
      quotes: [
        {
          product: 'Qwen3-32B TEE',
          billingUnit: 'tokens',
          inputUsdPerMillion: modelRates[0] ?? 0.104,
          outputUsdPerMillion: modelRates[1] ?? 0.416,
          qualifier: modelRates.length >= 2 ? 'Live page value' : '2026-08-30 verified fallback',
        },
        ...(typeof pro6000 === 'number'
          ? [{ product: 'RTX Pro 6000 private deployment', billingUnit: 'gpu-hour' as const, usdPerGpuHour: pro6000, qualifier: 'Live API value' }]
          : []),
      ],
    });
  },
};

export const nineteenAdapter: ProviderAdapter = {
  id: 'nineteen',
  async load() {
    const [landingResult, statusResult] = await Promise.allSettled([
      fetchText('https://nineteen.ai/'),
      fetchText('https://app.sn19.ai/app'),
    ]);
    if (landingResult.status === 'rejected' && statusResult.status === 'rejected') {
      throw new Error('Both official Nineteen sources were unavailable');
    }
    const landing = landingResult.status === 'fulfilled' ? landingResult.value : '';
    const statusPage = statusResult.status === 'fulfilled' ? statusResult.value : '';
    const operational = /Operational/i.test(statusPage);
    const zeroHeadline = /\$0\.00/.test(landing);

    return baseSnapshot({
      id: 'nineteen',
      name: 'Nineteen',
      subnet: 'SN19',
      status: operational ? 'API operational' : 'Public status unconfirmed',
      integration: 'watch',
      enabled: false,
      sourceUrl: 'https://nineteen.ai/',
      confidence: 'medium',
      note: 'Payments are advertised as live, but detailed public billing terms were not found.',
      quotes: zeroHeadline
        ? [{
            product: 'Provider landing-page headline',
            billingUnit: 'tokens',
            blendedUsdPerMillion: 0,
            qualifier: 'Asterisked “currently” headline; verify in account before routing',
          }]
        : [{ product: 'Public API', billingUnit: 'unpublished', qualifier: 'No public rate detected' }],
    });
  },
};

export const greenComputeAdapter: ProviderAdapter = {
  id: 'green-compute',
  async load() {
    const html = await fetchText('https://www.green-compute.com/');
    const rates = [...html.matchAll(/from\$([0-9.]+)\/GPU\/hr/g)].map((match) => Number(match[1]));

    return baseSnapshot({
      id: 'green-compute',
      name: 'Green Compute',
      subnet: 'SN110',
      status: 'Live marketplace',
      integration: 'available',
      enabled: true,
      sourceUrl: 'https://www.green-compute.com/',
      confidence: 'high',
      note: 'Rates are indicative starting prices; final provider quotes may change in the rental dashboard.',
      quotes: [
        { product: 'RTX 4090', billingUnit: 'gpu-hour', usdPerGpuHour: rates[0] ?? 0.4, qualifier: 'Indicative starting rate' },
        { product: 'RTX 5090', billingUnit: 'gpu-hour', usdPerGpuHour: rates[1] ?? 0.7, qualifier: 'Indicative starting rate' },
      ],
    });
  },
};

export const instantAdapter: ProviderAdapter = {
  id: 'instant',
  async load() {
    const docs = await fetchText('https://docs.instantsubnet.com/about/');
    const openAiCompatible = /OpenAI-compatible/i.test(docs);

    return baseSnapshot({
      id: 'instant',
      name: 'Instant',
      subnet: 'SN46',
      status: openAiCompatible ? 'Integration watch' : 'Status unconfirmed',
      integration: 'watch',
      enabled: false,
      sourceUrl: 'https://docs.instantsubnet.com/about/',
      confidence: 'high',
      note: 'Official architecture is public; no public customer price was found.',
      quotes: [{ product: 'OpenAI-compatible inference', billingUnit: 'unpublished', qualifier: 'Public price not published' }],
    });
  },
};

export const flopAdapter: ProviderAdapter = {
  id: 'flop',
  async load() {
    const teaser = await fetchText('https://flop.finance/teaser/');
    const q4Target = /Q4 2026/i.test(teaser);

    return baseSnapshot({
      id: 'flop',
      name: 'FLOP',
      subnet: q4Target ? 'Testnet target Q4 2026' : 'Testnet pending',
      status: 'Adapter ready—not connected',
      integration: 'planned',
      enabled: false,
      sourceUrl: 'https://flop.finance/teaser/',
      confidence: 'high',
      note: 'No official endpoint, schema, faucet procedure, or price API is published. Fail-closed by policy.',
      quotes: [{ product: 'Official testnet inference', billingUnit: 'planned', qualifier: 'Interface not released' }],
    });
  },
};

export const providerAdapters: ProviderAdapter[] = [
  chutesAdapter,
  nineteenAdapter,
  greenComputeAdapter,
  instantAdapter,
  flopAdapter,
];
