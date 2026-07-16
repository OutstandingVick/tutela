import { describe, expect, it } from "vitest";
import { PublicKey } from "@solana/web3.js";
import {
  TXLINE_DEVNET_PROGRAM_ID,
  buildValidateOutcomeInstruction,
  encodeTxLineStatValidationInput,
  parseTxLineStatValidationInput,
  txLineDailyScoresRoot
} from "../../packages/solana-client/src";

const ZERO = new Array(32).fill(0);
const rawProof = {
  ts: 1_768_000_000_000,
  fixtureSummary: {
    fixtureId: 18_257_865,
    updateStats: { updateCount: 4, minTimestamp: 1_768_000_000_000, maxTimestamp: 1_768_000_100_000 },
    eventsSubTreeRoot: ZERO
  },
  fixtureProof: [{ hash: ZERO, isRightSibling: false }],
  mainTreeProof: [{ hash: ZERO, isRightSibling: true }],
  eventStatRoot: ZERO,
  stats: [{ stat: { key: 1, value: 2, period: 100 }, statProof: [{ hash: ZERO, isRightSibling: false }] }]
};

describe("TxLINE settlement binary boundary", () => {
  it("binds validation to the official executable address and derived daily root", () => {
    const payload = parseTxLineStatValidationInput(rawProof);
    const ix = buildValidateOutcomeInstruction({
      programId: new PublicKey("GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG"),
      market: PublicKey.unique(),
      payload
    });
    expect(ix.keys[3].pubkey.equals(TXLINE_DEVNET_PROGRAM_ID)).toBe(true);
    expect(ix.keys[4].pubkey.equals(txLineDailyScoresRoot(payload.fixtureSummary.updateStats.minTimestamp)[0])).toBe(true);
  });

  it("changes the committed payload whenever fixture or statistics are altered", () => {
    const original = encodeTxLineStatValidationInput(parseTxLineStatValidationInput(rawProof));
    const wrongFixture = encodeTxLineStatValidationInput(parseTxLineStatValidationInput({
      ...rawProof,
      fixtureSummary: { ...rawProof.fixtureSummary, fixtureId: 18_257_739 }
    }));
    const alteredStat = encodeTxLineStatValidationInput(parseTxLineStatValidationInput({
      ...rawProof,
      stats: [{ ...rawProof.stats[0], stat: { ...rawProof.stats[0].stat, value: 3 } }]
    }));
    expect(Buffer.from(wrongFixture).equals(Buffer.from(original))).toBe(false);
    expect(Buffer.from(alteredStat).equals(Buffer.from(original))).toBe(false);
  });

  it("does not encode a caller-selected winning side", () => {
    const data = buildValidateOutcomeInstruction({
      programId: PublicKey.unique(),
      market: PublicKey.unique(),
      payload: parseTxLineStatValidationInput(rawProof)
    }).data;
    expect(data.subarray(0, 8)).toEqual(Buffer.from([29, 203, 125, 138, 197, 125, 152, 60]));
    expect(data.length).toBe(8 + encodeTxLineStatValidationInput(parseTxLineStatValidationInput(rawProof)).length);
  });
});
