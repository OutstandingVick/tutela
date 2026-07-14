import type { ConditionGroup, MarketCondition, MatchStats } from "@tutela/types";

const fieldOrder = [
  "MatchWinner",
  "TotalGoals",
  "TeamGoals",
  "PlayerGoals",
  "TotalCorners",
  "TeamCorners",
  "TotalCards",
  "TeamCards",
  "BothTeamsScore",
  "FirstGoal",
  "CleanSheet",
  "DoubleChance"
] as const;

const operatorOrder = ["Eq", "Neq", "Gt", "Gte", "Lt", "Lte", "IsTrue", "IsFalse"] as const;
const scopeOrder = ["FullTime", "RegulationTime", "Team", "Player", "Match"] as const;

export function canonicalConditionBytes(group: ConditionGroup): Uint8Array {
  const chunks: number[] = [];
  chunks.push(group.operator === "AND" ? 0 : 1);
  chunks.push(group.conditions.length);
  for (const condition of group.conditions) {
    chunks.push(fieldOrder.indexOf(condition.field));
    chunks.push(operatorOrder.indexOf(condition.operator));
    chunks.push(scopeOrder.indexOf(condition.scope));
    appendString(chunks, condition.teamId ?? "");
    appendString(chunks, condition.playerId ?? "");
    switch (condition.value.kind) {
      case "bool":
        chunks.push(0, condition.value.value ? 1 : 0);
        break;
      case "u16":
        chunks.push(1, condition.value.value & 0xff, (condition.value.value >> 8) & 0xff);
        break;
      case "team":
        chunks.push(2);
        appendString(chunks, condition.value.value);
        break;
      case "player":
        chunks.push(3);
        appendString(chunks, condition.value.value);
        break;
    }
  }
  return new Uint8Array(chunks);
}

export function conditionHash(group: ConditionGroup): string {
  return sha256Hex(canonicalConditionBytes(group));
}

export function sha256Hex(bytes: Uint8Array): string {
  const words = sha256(bytes);
  return words.map((word) => word.toString(16).padStart(8, "0")).join("");
}

export function evaluateConditionGroup(group: ConditionGroup, stats: MatchStats): boolean {
  const results = group.conditions.map((condition) => evaluateCondition(condition, stats));
  return group.operator === "AND" ? results.every(Boolean) : results.some(Boolean);
}

export function evaluateCondition(condition: MarketCondition, stats: MatchStats): boolean {
  const actual = actualValue(condition, stats);
  const expected = condition.value.kind === "bool" || condition.value.kind === "u16" ? condition.value.value : condition.value.value;
  switch (condition.operator) {
    case "Eq":
      return actual === expected;
    case "Neq":
      return actual !== expected;
    case "Gt":
      return Number(actual) > Number(expected);
    case "Gte":
      return Number(actual) >= Number(expected);
    case "Lt":
      return Number(actual) < Number(expected);
    case "Lte":
      return Number(actual) <= Number(expected);
    case "IsTrue":
      return actual === true;
    case "IsFalse":
      return actual === false;
  }
}

function actualValue(condition: MarketCondition, stats: MatchStats): number | boolean | string {
  const side = condition.teamId === "away" ? "away" : "home";
  switch (condition.field) {
    case "MatchWinner":
      return stats.winner;
    case "TotalGoals":
      return stats.totalGoals;
    case "TeamGoals":
      return side === "home" ? stats.homeGoals : stats.awayGoals;
    case "TotalCorners":
      return stats.totalCorners;
    case "TeamCorners":
      return side === "home" ? stats.homeCorners : stats.awayCorners;
    case "TotalCards":
      return stats.totalCards;
    case "TeamCards":
      return side === "home" ? stats.homeCards : stats.awayCards;
    case "BothTeamsScore":
      return stats.bothTeamsScore;
    case "FirstGoal":
      return stats.firstGoal;
    case "CleanSheet":
      return side === "home" ? stats.homeCleanSheet : stats.awayCleanSheet;
    case "DoubleChance":
      return stats.winner === "DRAW" ? "DRAW" : stats.winner;
    case "PlayerGoals":
      return 0;
  }
}

function appendString(chunks: number[], value: string) {
  const encoded = new TextEncoder().encode(value);
  chunks.push(encoded.length & 0xff, (encoded.length >> 8) & 0xff);
  chunks.push(...encoded);
}

const k = [
  0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
  0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
  0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
  0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
  0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
  0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
  0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
  0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2
];

function sha256(input: Uint8Array): number[] {
  const bitLength = input.length * 8;
  const paddedLength = Math.ceil((input.length + 9) / 64) * 64;
  const bytes = new Uint8Array(paddedLength);
  bytes.set(input);
  bytes[input.length] = 0x80;
  const view = new DataView(bytes.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 0x100000000));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  let h0 = 0x6a09e667;
  let h1 = 0xbb67ae85;
  let h2 = 0x3c6ef372;
  let h3 = 0xa54ff53a;
  let h4 = 0x510e527f;
  let h5 = 0x9b05688c;
  let h6 = 0x1f83d9ab;
  let h7 = 0x5be0cd19;
  const w = new Array<number>(64);

  for (let offset = 0; offset < bytes.length; offset += 64) {
    for (let i = 0; i < 16; i++) w[i] = view.getUint32(offset + i * 4);
    for (let i = 16; i < 64; i++) {
      const s0 = rotr(w[i - 15], 7) ^ rotr(w[i - 15], 18) ^ (w[i - 15] >>> 3);
      const s1 = rotr(w[i - 2], 17) ^ rotr(w[i - 2], 19) ^ (w[i - 2] >>> 10);
      w[i] = add32(w[i - 16], s0, w[i - 7], s1);
    }

    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    let f = h5;
    let g = h6;
    let h = h7;

    for (let i = 0; i < 64; i++) {
      const s1 = rotr(e, 6) ^ rotr(e, 11) ^ rotr(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = add32(h, s1, ch, k[i], w[i]);
      const s0 = rotr(a, 2) ^ rotr(a, 13) ^ rotr(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = add32(s0, maj);
      h = g;
      g = f;
      f = e;
      e = add32(d, temp1);
      d = c;
      c = b;
      b = a;
      a = add32(temp1, temp2);
    }

    h0 = add32(h0, a);
    h1 = add32(h1, b);
    h2 = add32(h2, c);
    h3 = add32(h3, d);
    h4 = add32(h4, e);
    h5 = add32(h5, f);
    h6 = add32(h6, g);
    h7 = add32(h7, h);
  }
  return [h0, h1, h2, h3, h4, h5, h6, h7];
}

function rotr(value: number, shift: number) {
  return (value >>> shift) | (value << (32 - shift));
}

function add32(...values: number[]) {
  return values.reduce((sum, value) => (sum + value) >>> 0, 0);
}
