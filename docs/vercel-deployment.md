# Vercel deployment

Tutela is a Solana devnet prototype. Demo points are free, non-transferable, cannot be purchased or cashed out, and have no monetary value.

## Project settings

Import the repository in Vercel and set the project Root Directory to `apps/web`. Allow the build to access files outside that directory because this is a pnpm workspace.

## Required environment variables

Add these values in Vercel Project Settings > Environment Variables for Production and Preview:

```text
NEXT_PUBLIC_PRIVY_APP_ID
NEXT_PUBLIC_PRIVY_CLIENT_ID        # only when Privy supplies one
PRIVY_APP_SECRET
DATABASE_URL                       # durable PostgreSQL, not SQLite
NEXT_PUBLIC_DATA_SOURCE=txline
TXLINE_API_BASE_URL=https://txline-dev.txodds.com/api
TXLINE_GUEST_AUTH_URL=https://txline-dev.txodds.com/auth/guest/start
TXLINE_API_TOKEN
TXLINE_GUEST_JWT                   # optional; refreshed when required
NEXT_PUBLIC_SOLANA_CLUSTER=devnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.devnet.solana.com
NEXT_PUBLIC_TXLINE_PROGRAM_ID=6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J
```

Do not commit `.env.local`. Vercel intentionally does not upload it. Add the deployed domain and each preview domain you intend to use to the Privy app's allowed origins.

## Verification

After deployment, open `/api/health`. A test-ready deployment returns HTTP 200 with all checks set to `true`:

```json
{
  "ready": true,
  "checks": { "database": true, "privy": true, "txline": true },
  "network": "solana-devnet",
  "realMoney": false
}
```

If it returns 503, correct the named environment variable and redeploy. Never paste Privy or TxLINE secrets into client-side variables.
