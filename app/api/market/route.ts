import { loadMarket } from '../../../lib/market/service';

export async function GET() {
  const market = await loadMarket();
  return Response.json(market, {
    headers: {
      'Cache-Control': 'public, max-age=0, s-maxage=300, stale-while-revalidate=900',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
