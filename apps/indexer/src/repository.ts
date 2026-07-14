import type { MatchSummary, TutelaMarket } from "@tutela/types";

export interface ReadRepository {
  listMatches(): Promise<MatchSummary[]>;
  listMarkets(): Promise<TutelaMarket[]>;
  upsertMarkets(markets: TutelaMarket[]): Promise<void>;
}

export class InMemoryReadRepository implements ReadRepository {
  constructor(private matches: MatchSummary[] = [], private markets: TutelaMarket[] = []) {}

  async listMatches() {
    return this.matches;
  }

  async listMarkets() {
    return this.markets;
  }

  async upsertMarkets(markets: TutelaMarket[]) {
    const byId = new Map(this.markets.map((market) => [market.id, market]));
    for (const market of markets) byId.set(market.id, market);
    this.markets = [...byId.values()];
  }
}
