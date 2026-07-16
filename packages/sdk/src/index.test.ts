import { PublicKey } from "@solana/web3.js";
import { describe, expect, it } from "vitest";
import {
  TXLINE_DEVNET_PROGRAM_ID,
  TutelaSdk,
  canonicalConditionBytes,
  conditionHash,
  validateConditionGroup,
  type ConditionGroup
} from "./index";

const group: ConditionGroup = {
  operator: "AND",
  conditions: [{
    field: "TotalGoals",
    operator: "Gte",
    scope: "FullTime",
    value: { kind: "u16", value: 3 }
  }]
};

describe("@tutela/sdk", () => {
  it("exposes one canonical condition pipeline", () => {
    expect(validateConditionGroup(group)).toEqual([]);
    expect(canonicalConditionBytes(group)).toBeInstanceOf(Uint8Array);
    expect(conditionHash(group)).toMatch(/^[0-9a-f]{64}$/);
  });

  it("derives protocol addresses from the configured Tutela program", () => {
    const programId = new PublicKey("GPhE8g6U87WgFnQdQUWjLhPgGLea8skpKokKTb4hSccE");
    const sdk = new TutelaSdk({ programId });
    const [protocol] = sdk.protocolAddress();

    expect(PublicKey.isOnCurve(protocol.toBytes())).toBe(false);
    expect(sdk.txLineProgramId.equals(TXLINE_DEVNET_PROGRAM_ID)).toBe(true);
  });
});
