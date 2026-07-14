use anchor_lang::prelude::*;

declare_id!("8fRo2KWuFW4r9EBKVNKBN6AvzszFMU7hd6p9EXcCEGxv");

#[program]
pub mod mock_verifier {
    use super::*;

    pub fn attest_mock_proof(ctx: Context<AttestMockProof>, proof_hash: [u8; 32]) -> Result<()> {
        emit!(MockProofAttested {
            attester: ctx.accounts.attester.key(),
            proof_hash
        });
        Ok(())
    }
}

#[derive(Accounts)]
pub struct AttestMockProof<'info> {
    pub attester: Signer<'info>,
}

#[event]
pub struct MockProofAttested {
    pub attester: Pubkey,
    pub proof_hash: [u8; 32],
}
