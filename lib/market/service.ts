import { providerAdapters } from './adapters';
import type { MarketResponse, ProviderSnapshot } from './types';

function unavailable(adapterId: ProviderSnapshot['id'], reason: string): ProviderSnapshot {
  const identity = {
    chutes: ['Chutes', 'SN64', 'https://chutes.ai/pricing'],
    nineteen: ['Nineteen', 'SN19', 'https://nineteen.ai/'],
    'green-compute': ['Green Compute', 'SN110', 'https://www.green-compute.com/'],
    instant: ['Instant', 'SN46', 'https://docs.instantsubnet.com/about/'],
    flop: ['FLOP', 'Testnet pending', 'https://flop.finance/teaser/'],
  }[adapterId];

  return {
    id: adapterId,
    name: identity[0],
    subnet: identity[1],
    status: 'Source temporarily unavailable',
    integration: adapterId === 'flop' ? 'planned' : 'watch',
    enabled: false,
    sourceUrl: identity[2],
    retrievedAt: new Date().toISOString(),
    confidence: 'medium',
    note: reason,
    quotes: [{ product: 'Source check', billingUnit: adapterId === 'flop' ? 'planned' : 'unpublished', qualifier: 'No cached price promoted as live' }],
  };
}

export async function loadMarket(): Promise<MarketResponse> {
  const results = await Promise.allSettled(providerAdapters.map((adapter) => adapter.load()));
  const providers = results.map((result, index) =>
    result.status === 'fulfilled'
      ? result.value
      : unavailable(providerAdapters[index].id, result.reason instanceof Error ? result.reason.message : 'Source request failed'),
  );

  return {
    generatedAt: new Date().toISOString(),
    providers,
    policy: {
      walletConnected: false,
      credentialsStored: false,
      inferenceEnabled: false,
    },
  };
}
