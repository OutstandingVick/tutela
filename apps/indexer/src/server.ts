import { createServer } from "node:http";
import { createSportsDataAdapter, loadTxLineConfigFromEnv } from "@tutela/txline-adapter";
import { InMemoryReadRepository } from "./repository";

const port = Number(process.env.INDEXER_PORT ?? 8787);
const dataSource = (process.env.DATA_SOURCE ?? process.env.NEXT_PUBLIC_DATA_SOURCE ?? "mock") === "txline" ? "txline" : "mock";
const adapter = createSportsDataAdapter({ source: dataSource, txline: loadTxLineConfigFromEnv() });

let matches: Awaited<ReturnType<typeof adapter.listMatches>> = [];
try {
  matches = await adapter.listMatches();
} catch (error) {
  console.warn(`Falling back to empty match list: ${(error as Error).message}`);
}
const repo = new InMemoryReadRepository(matches);

const server = createServer(async (req, res) => {
  res.setHeader("content-type", "application/json");
  try {
    if (req.url === "/health") return json(res, { ok: true, service: "tutela-indexer" });
    if (req.url === "/matches") return json(res, await repo.listMatches());
    if (req.url === "/markets") return json(res, await repo.listMarkets());
    res.statusCode = 404;
    return json(res, { error: "not_found" });
  } catch (error) {
    res.statusCode = 500;
    return json(res, { error: "internal_error", message: error instanceof Error ? error.message : "unknown" });
  }
});

server.listen(port, () => {
  console.log(JSON.stringify({ level: "info", service: "tutela-indexer", port }));
});

function json(res: { end: (body: string) => void }, body: unknown) {
  res.end(JSON.stringify(body));
}
