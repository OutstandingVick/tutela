# Troubleshooting

## pnpm missing

Run:

```bash
corepack enable
corepack prepare pnpm@9.15.4 --activate
```

## Cargo cannot fetch crates

The local environment needs DNS/network access to `index.crates.io`. Retry:

```bash
NO_DNA=1 anchor build
```

## Wallet not detected

Install Phantom or Solflare, switch to devnet, and refresh the app.
