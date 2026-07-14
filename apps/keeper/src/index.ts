import { Connection, clusterApiUrl } from "@solana/web3.js";
import { MockSportsDataAdapter } from "@tutela/txline-adapter";

type JobResult = { job: string; ok: boolean; message: string };

export class ReferenceKeeper {
  private adapter = new MockSportsDataAdapter();
  private connection = new Connection(process.env.SOLANA_RPC_URL ?? clusterApiUrl("devnet"), "confirmed");

  async runOnce(): Promise<JobResult[]> {
    return [await this.checkFinalProofs(), await this.checkRefundEligibility()];
  }

  async checkFinalProofs(): Promise<JobResult> {
    const matches = await this.adapter.listMatches({ status: "completed" });
    for (const match of matches) {
      await this.adapter.getFinalProof(match.id);
    }
    return { job: "final-proofs", ok: true, message: `checked ${matches.length} completed match(es)` };
  }

  async checkRefundEligibility(): Promise<JobResult> {
    await this.connection.getLatestBlockhash();
    return { job: "refund-eligibility", ok: true, message: "rpc reachable; no collateral authority held" };
  }

  async withBackoff<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
    let lastError: unknown;
    for (let i = 0; i < attempts; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        await new Promise((resolve) => setTimeout(resolve, 2 ** i * 250));
      }
    }
    throw lastError;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const keeper = new ReferenceKeeper();
  keeper.runOnce().then((results) => console.log(JSON.stringify({ level: "info", results })));
}
