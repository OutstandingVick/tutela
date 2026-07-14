import { demoMatches, MockSportsDataAdapter } from "../packages/txline-adapter/src/index.ts";

const adapter = new MockSportsDataAdapter();
const matches = await adapter.listMatches({ competition: "FIFA World Cup 2026 Semifinal" });

console.log(JSON.stringify({
  seeded: true,
  note: "Seeded only real upcoming semifinal fixtures. Final TxLINE proof packages are unavailable until match completion and endpoint credentials are configured.",
  matches: matches.map((match) => match.id),
  fixtureCount: demoMatches.length
}, null, 2));
