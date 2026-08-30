export type BillingUnit = 'tokens' | 'gpu-hour' | 'unpublished' | 'planned';
export type EvidenceConfidence = 'high' | 'medium';
export type IntegrationState = 'available' | 'watch' | 'planned';

export type MarketQuote = {
  product: string;
  billingUnit: BillingUnit;
  inputUsdPerMillion?: number;
  outputUsdPerMillion?: number;
  blendedUsdPerMillion?: number;
  usdPerGpuHour?: number;
  qualifier?: string;
};

export type ProviderSnapshot = {
  id: 'chutes' | 'nineteen' | 'green-compute' | 'instant' | 'flop';
  name: string;
  subnet: string;
  status: string;
  integration: IntegrationState;
  enabled: boolean;
  sourceUrl: string;
  retrievedAt: string;
  confidence: EvidenceConfidence;
  note: string;
  quotes: MarketQuote[];
};

export type MarketResponse = {
  generatedAt: string;
  providers: ProviderSnapshot[];
  policy: {
    walletConnected: false;
    credentialsStored: false;
    inferenceEnabled: false;
  };
};

export interface ProviderAdapter {
  readonly id: ProviderSnapshot['id'];
  load(): Promise<ProviderSnapshot>;
}
