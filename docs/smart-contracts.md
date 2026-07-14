# Smart Contracts

The Tutela Anchor program implements:

- Protocol config PDA `[b"protocol"]`
- Market PDA `[b"market", creator, nonce]`
- Vault authority PDA `[b"vault", market]`
- Position PDA `[b"position", market, user, side]`
- Proof PDA `[b"proof", market]`
- Creator profile PDA `[b"creator", creator]`

Settlement uses base units only:

`user_payout = user_deposit + floor(user_deposit * distributable_losing_pool / winning_pool)`

Dust remains in escrow until post-deadline account cleanup. Admins cannot redirect participant funds.
