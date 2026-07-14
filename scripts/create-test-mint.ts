console.log(`
Create a local/devnet SPL mint for test-USDC:

  spl-token create-token --decimals 6
  spl-token create-account <MINT>
  spl-token mint <MINT> 1000000

Record the mint in NEXT_PUBLIC_TEST_USDC_MINT. These are devnet/localnet test tokens only.
`);
