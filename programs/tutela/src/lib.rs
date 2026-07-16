use anchor_lang::prelude::*;
use anchor_lang::solana_program::{
    instruction::{AccountMeta, Instruction},
    program::{get_return_data, invoke},
};
use anchor_spl::token::{self, Mint, Token, TokenAccount, Transfer};
use sha2::{Digest, Sha256};

declare_id!("GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG");

const CREATOR_FEE_CAP_BPS: u16 = 500;
const BPS_DENOMINATOR: u128 = 10_000;
const MAX_CONDITIONS: u8 = 5;
const MARKET_TITLE_BYTES: usize = 96;
const MAX_CONDITION_BYTES: usize = 512;
const MAX_TXLINE_STATS: usize = 16;
const FINAL_PERIOD: i32 = 100;
const TXLINE_VALIDATE_STAT_V2_DISCRIMINATOR: [u8; 8] = [208, 215, 194, 214, 241, 71, 246, 178];
const TXLINE_DEVNET_PROGRAM_ID: Pubkey = pubkey!("6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J");

#[program]
pub mod tutela {
    use super::*;

    pub fn initialize_protocol(
        ctx: Context<InitializeProtocol>,
        protocol_fee_bps: u16,
        max_creator_fee_bps: u16,
        minimum_deposit: u64,
        maximum_deposit: u64,
        maximum_market_capacity: u32,
        verification_program_id: Pubkey,
    ) -> Result<()> {
        require_keys_eq!(
            verification_program_id,
            TXLINE_DEVNET_PROGRAM_ID,
            TutelaError::InvalidVerifier
        );
        require!(
            max_creator_fee_bps <= CREATOR_FEE_CAP_BPS,
            TutelaError::CreatorFeeTooHigh
        );
        require!(
            minimum_deposit > 0 && maximum_deposit >= minimum_deposit,
            TutelaError::InvalidDepositBounds
        );
        let config = &mut ctx.accounts.protocol_config;
        config.admin = ctx.accounts.admin.key();
        config.paused = false;
        config.protocol_fee_bps = protocol_fee_bps;
        config.max_creator_fee_bps = max_creator_fee_bps;
        config.max_conditions = MAX_CONDITIONS;
        config.minimum_deposit = minimum_deposit;
        config.maximum_deposit = maximum_deposit;
        config.maximum_market_capacity = maximum_market_capacity;
        config.allowed_collateral_mint = ctx.accounts.collateral_mint.key();
        config.verification_program_id = verification_program_id;
        config.version = 1;
        config.bump = ctx.bumps.protocol_config;
        emit!(ProtocolInitialized {
            admin: config.admin,
            collateral_mint: config.allowed_collateral_mint
        });
        Ok(())
    }

    pub fn update_protocol_config(
        ctx: Context<AdminConfig>,
        protocol_fee_bps: u16,
        max_creator_fee_bps: u16,
        minimum_deposit: u64,
        maximum_deposit: u64,
        maximum_market_capacity: u32,
        verification_program_id: Pubkey,
    ) -> Result<()> {
        require_keys_eq!(
            verification_program_id,
            TXLINE_DEVNET_PROGRAM_ID,
            TutelaError::InvalidVerifier
        );
        require!(
            max_creator_fee_bps <= CREATOR_FEE_CAP_BPS,
            TutelaError::CreatorFeeTooHigh
        );
        require!(
            minimum_deposit > 0 && maximum_deposit >= minimum_deposit,
            TutelaError::InvalidDepositBounds
        );
        let config = &mut ctx.accounts.protocol_config;
        config.protocol_fee_bps = protocol_fee_bps;
        config.max_creator_fee_bps = max_creator_fee_bps;
        config.minimum_deposit = minimum_deposit;
        config.maximum_deposit = maximum_deposit;
        config.maximum_market_capacity = maximum_market_capacity;
        config.verification_program_id = verification_program_id;
        emit!(ProtocolConfigUpdated {
            admin: config.admin,
            protocol_fee_bps,
            max_creator_fee_bps
        });
        Ok(())
    }

    pub fn pause_protocol(ctx: Context<AdminConfig>) -> Result<()> {
        ctx.accounts.protocol_config.paused = true;
        emit!(ProtocolPaused {
            admin: ctx.accounts.admin.key()
        });
        Ok(())
    }

    pub fn unpause_protocol(ctx: Context<AdminConfig>) -> Result<()> {
        ctx.accounts.protocol_config.paused = false;
        emit!(ProtocolUnpaused {
            admin: ctx.accounts.admin.key()
        });
        Ok(())
    }

    pub fn create_market(ctx: Context<CreateMarket>, args: CreateMarketArgs) -> Result<()> {
        let config = &ctx.accounts.protocol_config;
        require!(!config.paused, TutelaError::ProtocolPaused);
        require!(
            args.creator_fee_bps <= config.max_creator_fee_bps,
            TutelaError::CreatorFeeTooHigh
        );
        require!(
            args.condition_count > 0 && args.condition_count <= config.max_conditions,
            TutelaError::InvalidConditionCount
        );
        require!(
            args.condition_payload.len() <= MAX_CONDITION_BYTES,
            TutelaError::ConditionPayloadTooLarge
        );
        require!(
            args.minimum_deposit >= config.minimum_deposit,
            TutelaError::InvalidDepositBounds
        );
        require!(
            args.maximum_deposit <= config.maximum_deposit,
            TutelaError::InvalidDepositBounds
        );
        require!(
            args.participation_deadline > Clock::get()?.unix_timestamp,
            TutelaError::InvalidDeadline
        );
        require!(
            args.expected_match_end_timestamp > args.participation_deadline,
            TutelaError::InvalidDeadline
        );
        require!(
            args.refund_eligibility_timestamp > args.expected_match_end_timestamp,
            TutelaError::InvalidDeadline
        );

        let market = &mut ctx.accounts.market;
        market.version = 1;
        market.creator = ctx.accounts.creator.key();
        market.match_id = args.match_id;
        market.title = fixed_title(args.title);
        market.boolean_operator = args.boolean_operator;
        market.condition_count = args.condition_count;
        market.condition_payload = args.condition_payload.clone();
        market.condition_hash = sha256(&args.condition_payload);
        market.collateral_mint = ctx.accounts.collateral_mint.key();
        market.vault = ctx.accounts.vault.key();
        market.yes_pool = 0;
        market.no_pool = 0;
        market.participant_count = 0;
        market.minimum_deposit = args.minimum_deposit;
        market.maximum_deposit = args.maximum_deposit;
        market.maximum_capacity = config.maximum_market_capacity;
        market.creator_fee_bps = args.creator_fee_bps;
        market.protocol_fee_bps_snapshot = config.protocol_fee_bps;
        market.participation_deadline = args.participation_deadline;
        market.expected_match_end_timestamp = args.expected_match_end_timestamp;
        market.refund_eligibility_timestamp = args.refund_eligibility_timestamp;
        market.claim_deadline = args.claim_deadline;
        market.state = MarketState::Open;
        market.verified_result = None;
        market.created_timestamp = Clock::get()?.unix_timestamp;
        market.settled_timestamp = 0;
        market.creator_bond = 0;
        market.bump = ctx.bumps.market;
        market.vault_authority_bump = ctx.bumps.vault_authority;
        market.txline_fixture_id = args.txline_fixture_id;
        market.validated_stat_hash = [0; 32];

        let profile = &mut ctx.accounts.creator_profile;
        if profile.creator == Pubkey::default() {
            profile.creator = ctx.accounts.creator.key();
            profile.bump = ctx.bumps.creator_profile;
        }
        profile.markets_created = profile
            .markets_created
            .checked_add(1)
            .ok_or(TutelaError::MathOverflow)?;

        emit!(MarketCreated {
            market: market.key(),
            creator: market.creator,
            match_id: market.match_id,
            condition_hash: market.condition_hash
        });
        Ok(())
    }

    pub fn join_market(ctx: Context<JoinMarket>, side: Side, amount: u64) -> Result<()> {
        let config = &ctx.accounts.protocol_config;
        require!(!config.paused, TutelaError::ProtocolPaused);
        let market = &ctx.accounts.market;
        require!(market.state == MarketState::Open, TutelaError::InvalidState);
        require!(
            Clock::get()?.unix_timestamp < market.participation_deadline,
            TutelaError::DeadlinePassed
        );
        require!(
            amount >= market.minimum_deposit && amount <= market.maximum_deposit,
            TutelaError::InvalidDepositAmount
        );
        require!(
            market.participant_count < market.maximum_capacity,
            TutelaError::MarketCapacityReached
        );

        token::transfer(ctx.accounts.deposit_ctx(), amount)?;
        let market = &mut ctx.accounts.market;
        let position = &mut ctx.accounts.position;
        if position.owner == Pubkey::default() {
            position.market = market.key();
            position.owner = ctx.accounts.user.key();
            position.side = side;
            position.claimed = false;
            position.creator_position = ctx.accounts.user.key() == market.creator;
            position.deposited_timestamp = Clock::get()?.unix_timestamp;
            position.bump = ctx.bumps.position;
            market.participant_count = market
                .participant_count
                .checked_add(1)
                .ok_or(TutelaError::MathOverflow)?;
        } else {
            require!(position.side == side, TutelaError::SideCannotChange);
            require!(!position.claimed, TutelaError::AlreadyClaimed);
        }
        position.deposited_amount = position
            .deposited_amount
            .checked_add(amount)
            .ok_or(TutelaError::MathOverflow)?;
        match side {
            Side::Yes => {
                market.yes_pool = market
                    .yes_pool
                    .checked_add(amount)
                    .ok_or(TutelaError::MathOverflow)?
            }
            Side::No => {
                market.no_pool = market
                    .no_pool
                    .checked_add(amount)
                    .ok_or(TutelaError::MathOverflow)?
            }
        }
        Ok(())
    }

    pub fn lock_market(ctx: Context<LockMarket>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(market.state == MarketState::Open, TutelaError::InvalidState);
        require!(
            Clock::get()?.unix_timestamp >= market.participation_deadline,
            TutelaError::DeadlineNotReached
        );
        if market.yes_pool == 0 || market.no_pool == 0 {
            market.state = MarketState::Invalid;
            emit!(MarketInvalidated {
                market: market.key()
            });
        } else {
            market.state = MarketState::AwaitingResult;
            emit!(MarketLocked {
                market: market.key()
            });
        }
        Ok(())
    }

    pub fn submit_proof(ctx: Context<SubmitProof>, args: ProofArgs) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(
            market.state == MarketState::AwaitingResult,
            TutelaError::InvalidState
        );
        require!(
            Clock::get()?.unix_timestamp < market.refund_eligibility_timestamp,
            TutelaError::RefundPathAlreadyAvailable
        );
        require!(args.match_id == market.match_id, TutelaError::MatchMismatch);
        require!(
            args.finalization_timestamp >= market.expected_match_end_timestamp,
            TutelaError::InvalidProofTimestamp
        );
        let proof = &mut ctx.accounts.proof;
        require!(
            proof.market == Pubkey::default(),
            TutelaError::DuplicateProof
        );
        proof.market = market.key();
        proof.submitted_by = ctx.accounts.submitter.key();
        proof.submitted_timestamp = Clock::get()?.unix_timestamp;
        proof.proof_hash = args.proof_hash;
        proof.match_id = args.match_id;
        proof.finalization_timestamp = args.finalization_timestamp;
        proof.verification_status = VerificationStatus::Submitted;
        proof.stat_payload_hash = args.stat_payload_hash;
        proof.bump = ctx.bumps.proof;
        market.state = MarketState::ProofSubmitted;
        emit!(ProofSubmitted {
            market: market.key(),
            submitted_by: proof.submitted_by,
            proof_hash: proof.proof_hash
        });
        Ok(())
    }

    pub fn validate_outcome(
        ctx: Context<ValidateOutcome>,
        payload: StatValidationInput,
    ) -> Result<()> {
        let config = &ctx.accounts.protocol_config;
        let market = &mut ctx.accounts.market;
        let proof = &mut ctx.accounts.proof;
        require!(
            market.state == MarketState::ProofSubmitted,
            TutelaError::InvalidState
        );
        require_keys_eq!(
            config.verification_program_id,
            TXLINE_DEVNET_PROGRAM_ID,
            TutelaError::InvalidVerifier
        );
        require_keys_eq!(
            ctx.accounts.txline_program.key(),
            config.verification_program_id,
            TutelaError::InvalidVerifier
        );
        require!(
            ctx.accounts.txline_program.executable,
            TutelaError::VerifierNotExecutable
        );
        ensure_proof_submitted(proof.verification_status)?;
        let payload_hash = validate_payload_binding(
            market.txline_fixture_id,
            market.expected_match_end_timestamp,
            proof.stat_payload_hash,
            &payload,
        )?;

        let epoch_day = epoch_day(payload.fixture_summary.update_stats.min_timestamp)?;
        let (expected_daily_root, _) = Pubkey::find_program_address(
            &[b"daily_scores_roots", &epoch_day.to_le_bytes()],
            &TXLINE_DEVNET_PROGRAM_ID,
        );
        require_keys_eq!(
            ctx.accounts.daily_scores_merkle_roots.key(),
            expected_daily_root,
            TutelaError::InvalidDailyRoot
        );

        let strategy = exact_stat_strategy(&payload.stats)?;
        invoke_txline_validate_stat_v2(
            &ctx.accounts.txline_program,
            &ctx.accounts.daily_scores_merkle_roots,
            &payload,
            &strategy,
        )?;

        let group_result = evaluate_condition_payload(
            &market.condition_payload,
            market.boolean_operator,
            market.condition_count,
            &payload.stats,
        )?;
        let winning_side = if group_result { Side::Yes } else { Side::No };
        proof.verification_status = VerificationStatus::Verified;
        market.verified_result = Some(winning_side);
        market.validated_stat_hash = payload_hash;
        market.state = MarketState::Verified;
        emit!(OutcomeVerified {
            market: market.key(),
            winning_side
        });
        Ok(())
    }

    pub fn settle_market(ctx: Context<SettleMarket>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(
            market.state == MarketState::Verified,
            TutelaError::InvalidState
        );
        let total = checked_add_u64(market.yes_pool, market.no_pool)?;
        let protocol_fee = fee(total, market.protocol_fee_bps_snapshot)?;
        let creator_fee = fee(total, market.creator_fee_bps)?;
        let net_pool = checked_sub_u64(checked_sub_u64(total, protocol_fee)?, creator_fee)?;
        let winning_pool = match market.verified_result.ok_or(TutelaError::MissingResult)? {
            Side::Yes => market.yes_pool,
            Side::No => market.no_pool,
        };
        require!(winning_pool > 0, TutelaError::InvalidWinningPool);
        market.net_pool = net_pool;
        market.protocol_fee_amount = protocol_fee;
        market.creator_fee_amount = creator_fee;
        market.state = MarketState::Settled;
        market.settled_timestamp = Clock::get()?.unix_timestamp;
        emit!(MarketSettled {
            market: market.key(),
            winning_side: market.verified_result.unwrap(),
            net_pool
        });
        Ok(())
    }

    pub fn claim_payout(ctx: Context<ClaimPayout>) -> Result<()> {
        let market = &ctx.accounts.market;
        require!(
            market.state == MarketState::Settled,
            TutelaError::InvalidState
        );
        let position = &mut ctx.accounts.position;
        require!(!position.claimed, TutelaError::AlreadyClaimed);
        require!(
            Some(position.side) == market.verified_result,
            TutelaError::NotWinningPosition
        );
        let winning_pool = match position.side {
            Side::Yes => market.yes_pool,
            Side::No => market.no_pool,
        };
        let losing_pool_after_fees = checked_sub_u64(market.net_pool, winning_pool)?;
        let pro_rata = ((position.deposited_amount as u128)
            .checked_mul(losing_pool_after_fees as u128)
            .ok_or(TutelaError::MathOverflow)?)
        .checked_div(winning_pool as u128)
        .ok_or(TutelaError::MathOverflow)? as u64;
        let payout = checked_add_u64(position.deposited_amount, pro_rata)?;
        let owner = position.owner;
        position.claimed = true;
        let market_key = market.key();
        let bump = [market.vault_authority_bump];
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", market_key.as_ref(), &bump]];
        token::transfer(
            ctx.accounts.vault_to_user_ctx().with_signer(signer_seeds),
            payout,
        )?;
        emit!(PayoutClaimed {
            market: market.key(),
            owner,
            amount: payout
        });
        Ok(())
    }

    pub fn cancel_market(ctx: Context<CancelMarket>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(
            market.creator == ctx.accounts.creator.key(),
            TutelaError::Unauthorized
        );
        require!(
            market.state == MarketState::Open && market.participant_count == 0,
            TutelaError::InvalidState
        );
        market.state = MarketState::Cancelled;
        emit!(MarketCancelled {
            market: market.key()
        });
        Ok(())
    }

    pub fn trigger_refund_eligibility(ctx: Context<RefundEligibility>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(
            matches!(
                market.state,
                MarketState::AwaitingResult | MarketState::Invalid | MarketState::Cancelled
            ),
            TutelaError::InvalidState
        );
        require!(
            Clock::get()?.unix_timestamp >= market.refund_eligibility_timestamp
                || market.state != MarketState::AwaitingResult,
            TutelaError::DeadlineNotReached
        );
        market.state = MarketState::RefundEligible;
        emit!(RefundEligible {
            market: market.key()
        });
        Ok(())
    }

    pub fn claim_refund(ctx: Context<ClaimRefund>) -> Result<()> {
        let market = &ctx.accounts.market;
        require!(
            matches!(
                market.state,
                MarketState::RefundEligible | MarketState::Invalid | MarketState::Cancelled
            ),
            TutelaError::InvalidState
        );
        let position = &mut ctx.accounts.position;
        require!(!position.claimed, TutelaError::AlreadyClaimed);
        let amount = position.deposited_amount;
        let owner = position.owner;
        position.claimed = true;
        let market_key = market.key();
        let bump = [market.vault_authority_bump];
        let signer_seeds: &[&[&[u8]]] = &[&[b"vault", market_key.as_ref(), &bump]];
        token::transfer(
            ctx.accounts.vault_to_user_ctx().with_signer(signer_seeds),
            amount,
        )?;
        emit!(RefundClaimed {
            market: market.key(),
            owner,
            amount
        });
        Ok(())
    }

    pub fn close_market_accounts(ctx: Context<CloseMarketAccounts>) -> Result<()> {
        let market = &mut ctx.accounts.market;
        require!(
            matches!(
                market.state,
                MarketState::Settled
                    | MarketState::RefundEligible
                    | MarketState::Cancelled
                    | MarketState::Invalid
            ),
            TutelaError::InvalidState
        );
        require!(
            Clock::get()?.unix_timestamp >= market.claim_deadline,
            TutelaError::DeadlineNotReached
        );
        market.state = MarketState::Closed;
        emit!(MarketClosed {
            market: market.key()
        });
        Ok(())
    }
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct CreateMarketArgs {
    pub market_nonce: [u8; 8],
    pub match_id: [u8; 32],
    pub txline_fixture_id: i64,
    pub title: String,
    pub boolean_operator: BooleanOperator,
    pub condition_count: u8,
    pub condition_payload: Vec<u8>,
    pub minimum_deposit: u64,
    pub maximum_deposit: u64,
    pub creator_fee_bps: u16,
    pub participation_deadline: i64,
    pub expected_match_end_timestamp: i64,
    pub refund_eligibility_timestamp: i64,
    pub claim_deadline: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone)]
pub struct ProofArgs {
    pub proof_hash: [u8; 32],
    pub match_id: [u8; 32],
    pub finalization_timestamp: i64,
    pub stat_payload_hash: [u8; 32],
}

#[derive(Accounts)]
pub struct InitializeProtocol<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
    #[account(init, payer = admin, space = ProtocolConfig::SPACE, seeds = [b"protocol"], bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    pub collateral_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct AdminConfig<'info> {
    #[account(mut, has_one = admin)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    pub admin: Signer<'info>,
}

#[derive(Accounts)]
#[instruction(args: CreateMarketArgs)]
pub struct CreateMarket<'info> {
    #[account(mut)]
    pub creator: Signer<'info>,
    #[account(seeds = [b"protocol"], bump = protocol_config.bump, constraint = collateral_mint.key() == protocol_config.allowed_collateral_mint)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(init_if_needed, payer = creator, space = CreatorProfile::SPACE, seeds = [b"creator", creator.key().as_ref()], bump)]
    pub creator_profile: Account<'info, CreatorProfile>,
    #[account(init, payer = creator, space = Market::SPACE, seeds = [b"market", creator.key().as_ref(), &args.market_nonce], bump)]
    pub market: Account<'info, Market>,
    /// CHECK: PDA authority only.
    #[account(seeds = [b"vault", market.key().as_ref()], bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(init, payer = creator, token::mint = collateral_mint, token::authority = vault_authority)]
    pub vault: Account<'info, TokenAccount>,
    pub collateral_mint: Account<'info, Mint>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
    pub rent: Sysvar<'info, Rent>,
}

#[derive(Accounts)]
#[instruction(side: Side)]
pub struct JoinMarket<'info> {
    #[account(mut)]
    pub user: Signer<'info>,
    #[account(seeds = [b"protocol"], bump = protocol_config.bump, constraint = market.collateral_mint == protocol_config.allowed_collateral_mint)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut, has_one = vault)]
    pub market: Account<'info, Market>,
    #[account(mut, constraint = user_token.mint == market.collateral_mint, constraint = user_token.owner == user.key())]
    pub user_token: Account<'info, TokenAccount>,
    #[account(mut, constraint = vault.key() == market.vault)]
    pub vault: Account<'info, TokenAccount>,
    #[account(init_if_needed, payer = user, space = Position::SPACE, seeds = [b"position", market.key().as_ref(), user.key().as_ref(), &[side as u8]], bump)]
    pub position: Account<'info, Position>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> JoinMarket<'info> {
    fn deposit_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.user_token.to_account_info(),
                to: self.vault.to_account_info(),
                authority: self.user.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct LockMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
pub struct SubmitProof<'info> {
    #[account(mut)]
    pub submitter: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(init, payer = submitter, space = ProofSubmissionRecord::SPACE, seeds = [b"proof", market.key().as_ref()], bump)]
    pub proof: Account<'info, ProofSubmissionRecord>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ValidateOutcome<'info> {
    #[account(seeds = [b"protocol"], bump = protocol_config.bump)]
    pub protocol_config: Account<'info, ProtocolConfig>,
    #[account(mut)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"proof", market.key().as_ref()], bump = proof.bump)]
    pub proof: Account<'info, ProofSubmissionRecord>,
    /// CHECK: Constrained to the configured executable TxLINE program in the handler.
    pub txline_program: UncheckedAccount<'info>,
    /// CHECK: TxLINE-owned daily root PDA; address is derived and checked in the handler.
    pub daily_scores_merkle_roots: UncheckedAccount<'info>,
}

#[derive(Accounts)]
pub struct SettleMarket<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
pub struct ClaimPayout<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = vault)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"position", market.key().as_ref(), owner.key().as_ref(), &[position.side as u8]], bump = position.bump)]
    pub position: Account<'info, Position>,
    #[account(mut, constraint = vault.key() == market.vault)]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority constrained by seeds.
    #[account(seeds = [b"vault", market.key().as_ref()], bump = market.vault_authority_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut, constraint = owner_token.owner == owner.key(), constraint = owner_token.mint == market.collateral_mint)]
    pub owner_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

impl<'info> ClaimPayout<'info> {
    fn vault_to_user_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault.to_account_info(),
                to: self.owner_token.to_account_info(),
                authority: self.vault_authority.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct CancelMarket<'info> {
    pub creator: Signer<'info>,
    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
pub struct RefundEligibility<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[derive(Accounts)]
pub struct ClaimRefund<'info> {
    #[account(mut)]
    pub owner: Signer<'info>,
    #[account(mut, has_one = vault)]
    pub market: Account<'info, Market>,
    #[account(mut, seeds = [b"position", market.key().as_ref(), owner.key().as_ref(), &[position.side as u8]], bump = position.bump)]
    pub position: Account<'info, Position>,
    #[account(mut, constraint = vault.key() == market.vault)]
    pub vault: Account<'info, TokenAccount>,
    /// CHECK: PDA authority constrained by seeds.
    #[account(seeds = [b"vault", market.key().as_ref()], bump = market.vault_authority_bump)]
    pub vault_authority: UncheckedAccount<'info>,
    #[account(mut, constraint = owner_token.owner == owner.key(), constraint = owner_token.mint == market.collateral_mint)]
    pub owner_token: Account<'info, TokenAccount>,
    pub token_program: Program<'info, Token>,
}

impl<'info> ClaimRefund<'info> {
    fn vault_to_user_ctx(&self) -> CpiContext<'_, '_, '_, 'info, Transfer<'info>> {
        CpiContext::new(
            self.token_program.to_account_info(),
            Transfer {
                from: self.vault.to_account_info(),
                to: self.owner_token.to_account_info(),
                authority: self.vault_authority.to_account_info(),
            },
        )
    }
}

#[derive(Accounts)]
pub struct CloseMarketAccounts<'info> {
    #[account(mut)]
    pub market: Account<'info, Market>,
}

#[account]
pub struct ProtocolConfig {
    pub admin: Pubkey,
    pub paused: bool,
    pub protocol_fee_bps: u16,
    pub max_creator_fee_bps: u16,
    pub max_conditions: u8,
    pub minimum_deposit: u64,
    pub maximum_deposit: u64,
    pub maximum_market_capacity: u32,
    pub allowed_collateral_mint: Pubkey,
    pub verification_program_id: Pubkey,
    pub version: u8,
    pub bump: u8,
}

impl ProtocolConfig {
    pub const SPACE: usize = 8 + 32 + 1 + 2 + 2 + 1 + 8 + 8 + 4 + 32 + 32 + 1 + 1;
}

#[account]
pub struct Market {
    pub version: u8,
    pub creator: Pubkey,
    pub match_id: [u8; 32],
    pub title: [u8; MARKET_TITLE_BYTES],
    pub boolean_operator: BooleanOperator,
    pub condition_count: u8,
    pub condition_payload: Vec<u8>,
    pub condition_hash: [u8; 32],
    pub collateral_mint: Pubkey,
    pub vault: Pubkey,
    pub yes_pool: u64,
    pub no_pool: u64,
    pub participant_count: u32,
    pub minimum_deposit: u64,
    pub maximum_deposit: u64,
    pub maximum_capacity: u32,
    pub creator_fee_bps: u16,
    pub protocol_fee_bps_snapshot: u16,
    pub participation_deadline: i64,
    pub expected_match_end_timestamp: i64,
    pub refund_eligibility_timestamp: i64,
    pub claim_deadline: i64,
    pub state: MarketState,
    pub verified_result: Option<Side>,
    pub created_timestamp: i64,
    pub settled_timestamp: i64,
    pub creator_bond: u64,
    pub net_pool: u64,
    pub protocol_fee_amount: u64,
    pub creator_fee_amount: u64,
    pub bump: u8,
    pub vault_authority_bump: u8,
    pub txline_fixture_id: i64,
    pub validated_stat_hash: [u8; 32],
}

impl Market {
    pub const SPACE: usize = 8
        + 1
        + 32
        + 32
        + MARKET_TITLE_BYTES
        + 1
        + 1
        + 4
        + MAX_CONDITION_BYTES
        + 32
        + 32
        + 32
        + 8
        + 8
        + 4
        + 8
        + 8
        + 4
        + 2
        + 2
        + 8
        + 8
        + 8
        + 8
        + 1
        + 2
        + 8
        + 8
        + 8
        + 8
        + 8
        + 8
        + 1
        + 1
        + 8
        + 32;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ProofNode {
    pub hash: [u8; 32],
    pub is_right_sibling: bool,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ScoreStat {
    pub key: u32,
    pub value: i32,
    pub period: i32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ScoresUpdateStats {
    pub update_count: i32,
    pub min_timestamp: i64,
    pub max_timestamp: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct ScoresBatchSummary {
    pub fixture_id: i64,
    pub update_stats: ScoresUpdateStats,
    pub events_sub_tree_root: [u8; 32],
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct StatLeaf {
    pub stat: ScoreStat,
    pub stat_proof: Vec<ProofNode>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct StatValidationInput {
    pub ts: i64,
    pub fixture_summary: ScoresBatchSummary,
    pub fixture_proof: Vec<ProofNode>,
    pub main_tree_proof: Vec<ProofNode>,
    pub event_stat_root: [u8; 32],
    pub stats: Vec<StatLeaf>,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum Comparison {
    GreaterThan,
    LessThan,
    EqualTo,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct TraderPredicate {
    pub threshold: i32,
    pub comparison: Comparison,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct GeometricTarget {
    pub stat_index: u8,
    pub prediction: i32,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, Debug, PartialEq, Eq)]
pub enum BinaryExpression {
    Add,
    Subtract,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub enum StatPredicate {
    Single {
        index: u8,
        predicate: TraderPredicate,
    },
    Binary {
        index_a: u8,
        index_b: u8,
        op: BinaryExpression,
        predicate: TraderPredicate,
    },
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Debug, PartialEq, Eq)]
pub struct NDimensionalStrategy {
    pub geometric_targets: Vec<GeometricTarget>,
    pub distance_predicate: Option<TraderPredicate>,
    pub discrete_predicates: Vec<StatPredicate>,
}

#[account]
pub struct Position {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub side: Side,
    pub deposited_amount: u64,
    pub claimed: bool,
    pub creator_position: bool,
    pub deposited_timestamp: i64,
    pub bump: u8,
}

impl Position {
    pub const SPACE: usize = 8 + 32 + 32 + 1 + 8 + 1 + 1 + 8 + 1;
}

#[account]
pub struct ProofSubmissionRecord {
    pub market: Pubkey,
    pub submitted_by: Pubkey,
    pub submitted_timestamp: i64,
    pub proof_hash: [u8; 32],
    pub match_id: [u8; 32],
    pub finalization_timestamp: i64,
    pub verification_status: VerificationStatus,
    pub stat_payload_hash: [u8; 32],
    pub bump: u8,
}

impl ProofSubmissionRecord {
    pub const SPACE: usize = 8 + 32 + 32 + 8 + 32 + 32 + 8 + 1 + 32 + 1;
}

#[account]
pub struct CreatorProfile {
    pub creator: Pubkey,
    pub markets_created: u64,
    pub valid_settlements: u64,
    pub cancelled_markets: u64,
    pub cumulative_creator_fees: u64,
    pub rate_limit_window: i64,
    pub rate_limit_count: u16,
    pub bump: u8,
}

impl CreatorProfile {
    pub const SPACE: usize = 8 + 32 + 8 + 8 + 8 + 8 + 8 + 2 + 1;
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum BooleanOperator {
    And,
    Or,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum Side {
    Yes = 0,
    No = 1,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum MarketState {
    Draft,
    Open,
    Locked,
    AwaitingResult,
    ProofSubmitted,
    Verified,
    Settled,
    RefundEligible,
    Refunded,
    Cancelled,
    Invalid,
    Closed,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, Copy, PartialEq, Eq)]
pub enum VerificationStatus {
    Submitted,
    Verified,
    Rejected,
}

#[event]
pub struct ProtocolInitialized {
    pub admin: Pubkey,
    pub collateral_mint: Pubkey,
}
#[event]
pub struct ProtocolConfigUpdated {
    pub admin: Pubkey,
    pub protocol_fee_bps: u16,
    pub max_creator_fee_bps: u16,
}
#[event]
pub struct ProtocolPaused {
    pub admin: Pubkey,
}
#[event]
pub struct ProtocolUnpaused {
    pub admin: Pubkey,
}
#[event]
pub struct MarketCreated {
    pub market: Pubkey,
    pub creator: Pubkey,
    pub match_id: [u8; 32],
    pub condition_hash: [u8; 32],
}
#[event]
pub struct MarketLocked {
    pub market: Pubkey,
}
#[event]
pub struct MarketInvalidated {
    pub market: Pubkey,
}
#[event]
pub struct ProofSubmitted {
    pub market: Pubkey,
    pub submitted_by: Pubkey,
    pub proof_hash: [u8; 32],
}
#[event]
pub struct ProofRejected {
    pub market: Pubkey,
}
#[event]
pub struct OutcomeVerified {
    pub market: Pubkey,
    pub winning_side: Side,
}
#[event]
pub struct MarketSettled {
    pub market: Pubkey,
    pub winning_side: Side,
    pub net_pool: u64,
}
#[event]
pub struct RefundEligible {
    pub market: Pubkey,
}
#[event]
pub struct RefundClaimed {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
}
#[event]
pub struct PayoutClaimed {
    pub market: Pubkey,
    pub owner: Pubkey,
    pub amount: u64,
}
#[event]
pub struct MarketCancelled {
    pub market: Pubkey,
}
#[event]
pub struct MarketClosed {
    pub market: Pubkey,
}

#[error_code]
pub enum TutelaError {
    #[msg("Protocol is paused for creation and deposits.")]
    ProtocolPaused,
    #[msg("Creator fee exceeds the hard cap.")]
    CreatorFeeTooHigh,
    #[msg("Deposit bounds are invalid.")]
    InvalidDepositBounds,
    #[msg("Condition count is invalid.")]
    InvalidConditionCount,
    #[msg("Condition payload is too large.")]
    ConditionPayloadTooLarge,
    #[msg("Deadline is invalid.")]
    InvalidDeadline,
    #[msg("Market is in the wrong state.")]
    InvalidState,
    #[msg("Participation deadline has passed.")]
    DeadlinePassed,
    #[msg("Deadline has not been reached.")]
    DeadlineNotReached,
    #[msg("Deposit amount is invalid.")]
    InvalidDepositAmount,
    #[msg("Market capacity reached.")]
    MarketCapacityReached,
    #[msg("A wallet cannot change side after depositing.")]
    SideCannotChange,
    #[msg("Position has already claimed.")]
    AlreadyClaimed,
    #[msg("Proof match id does not match market.")]
    MatchMismatch,
    #[msg("Proof timestamp is invalid.")]
    InvalidProofTimestamp,
    #[msg("A proof was already submitted.")]
    DuplicateProof,
    #[msg("Refund path is already available.")]
    RefundPathAlreadyAvailable,
    #[msg("Verifier identity does not match protocol config.")]
    InvalidVerifier,
    #[msg("Configured verifier account is not executable.")]
    VerifierNotExecutable,
    #[msg("TxLINE daily scores root PDA is invalid.")]
    InvalidDailyRoot,
    #[msg("TxLINE stat payload is malformed or unsupported.")]
    InvalidStatPayload,
    #[msg("Settlement requires TxLINE final-period statistics.")]
    NonFinalStatistics,
    #[msg("TxLINE CPI did not authenticate the supplied statistics.")]
    StatValidationFailed,
    #[msg("Stored condition bytes are malformed or unsupported on-chain.")]
    InvalidConditionPayload,
    #[msg("A statistic required by the market conditions is missing.")]
    RequiredStatMissing,
    #[msg("Proof payload hash mismatch.")]
    ProofPayloadMismatch,
    #[msg("Verified result is missing.")]
    MissingResult,
    #[msg("Winning pool is invalid.")]
    InvalidWinningPool,
    #[msg("Position is not on the winning side.")]
    NotWinningPosition,
    #[msg("Unauthorized.")]
    Unauthorized,
    #[msg("Math overflow.")]
    MathOverflow,
}

fn invoke_txline_validate_stat_v2<'info>(
    txline_program: &UncheckedAccount<'info>,
    daily_scores_merkle_roots: &UncheckedAccount<'info>,
    payload: &StatValidationInput,
    strategy: &NDimensionalStrategy,
) -> Result<()> {
    let mut data = TXLINE_VALIDATE_STAT_V2_DISCRIMINATOR.to_vec();
    payload
        .serialize(&mut data)
        .map_err(|_| error!(TutelaError::InvalidStatPayload))?;
    strategy
        .serialize(&mut data)
        .map_err(|_| error!(TutelaError::InvalidStatPayload))?;

    let instruction = Instruction {
        program_id: txline_program.key(),
        accounts: vec![AccountMeta::new_readonly(
            daily_scores_merkle_roots.key(),
            false,
        )],
        data,
    };
    invoke(
        &instruction,
        &[
            daily_scores_merkle_roots.to_account_info(),
            txline_program.to_account_info(),
        ],
    )?;

    let (returning_program, return_data) =
        get_return_data().ok_or(error!(TutelaError::StatValidationFailed))?;
    validate_txline_return(returning_program, txline_program.key(), &return_data)
}

fn validate_txline_return(
    returning_program: Pubkey,
    expected_program: Pubkey,
    data: &[u8],
) -> Result<()> {
    require_keys_eq!(
        returning_program,
        expected_program,
        TutelaError::InvalidVerifier
    );
    require!(data == [1u8], TutelaError::StatValidationFailed);
    Ok(())
}

fn exact_stat_strategy(stats: &[StatLeaf]) -> Result<NDimensionalStrategy> {
    let discrete_predicates = stats
        .iter()
        .enumerate()
        .map(|(index, leaf)| {
            let index = u8::try_from(index).map_err(|_| error!(TutelaError::InvalidStatPayload))?;
            Ok(StatPredicate::Single {
                index,
                predicate: TraderPredicate {
                    threshold: leaf.stat.value,
                    comparison: Comparison::EqualTo,
                },
            })
        })
        .collect::<Result<Vec<_>>>()?;
    Ok(NDimensionalStrategy {
        geometric_targets: vec![],
        distance_predicate: None,
        discrete_predicates,
    })
}

fn validate_unique_stats(stats: &[StatLeaf]) -> Result<()> {
    for (index, leaf) in stats.iter().enumerate() {
        require!(
            !stats[..index]
                .iter()
                .any(|previous| previous.stat.key == leaf.stat.key),
            TutelaError::InvalidStatPayload
        );
    }
    Ok(())
}

fn ensure_proof_submitted(status: VerificationStatus) -> Result<()> {
    require!(
        status == VerificationStatus::Submitted,
        TutelaError::DuplicateProof
    );
    Ok(())
}

fn validate_payload_binding(
    fixture_id: i64,
    expected_match_end_timestamp: i64,
    expected_payload_hash: [u8; 32],
    payload: &StatValidationInput,
) -> Result<[u8; 32]> {
    require!(
        payload.fixture_summary.fixture_id == fixture_id,
        TutelaError::MatchMismatch
    );
    require!(
        !payload.stats.is_empty() && payload.stats.len() <= MAX_TXLINE_STATS,
        TutelaError::InvalidStatPayload
    );
    require!(
        payload
            .stats
            .iter()
            .all(|leaf| leaf.stat.period == FINAL_PERIOD),
        TutelaError::NonFinalStatistics
    );
    validate_unique_stats(&payload.stats)?;

    let payload_bytes = payload
        .try_to_vec()
        .map_err(|_| error!(TutelaError::InvalidStatPayload))?;
    let payload_hash = sha256(&payload_bytes);
    require!(
        expected_payload_hash == payload_hash,
        TutelaError::ProofPayloadMismatch
    );

    let min_timestamp = unix_seconds(payload.fixture_summary.update_stats.min_timestamp)?;
    let max_timestamp = unix_seconds(payload.fixture_summary.update_stats.max_timestamp)?;
    require!(
        min_timestamp >= expected_match_end_timestamp,
        TutelaError::InvalidProofTimestamp
    );
    require!(
        max_timestamp >= min_timestamp,
        TutelaError::InvalidProofTimestamp
    );
    Ok(payload_hash)
}

fn unix_seconds(timestamp: i64) -> Result<i64> {
    require!(timestamp > 0, TutelaError::InvalidProofTimestamp);
    Ok(if timestamp > 10_000_000_000 {
        timestamp
            .checked_div(1_000)
            .ok_or(error!(TutelaError::MathOverflow))?
    } else {
        timestamp
    })
}

fn epoch_day(timestamp: i64) -> Result<u16> {
    let day = unix_seconds(timestamp)?
        .checked_div(86_400)
        .ok_or(error!(TutelaError::MathOverflow))?;
    u16::try_from(day).map_err(|_| error!(TutelaError::InvalidProofTimestamp))
}

fn evaluate_condition_payload(
    bytes: &[u8],
    market_operator: BooleanOperator,
    condition_count: u8,
    stats: &[StatLeaf],
) -> Result<bool> {
    let mut cursor = ConditionCursor::new(bytes);
    let encoded_operator = cursor.u8()?;
    let encoded_count = cursor.u8()?;
    require!(
        encoded_count == condition_count,
        TutelaError::InvalidConditionPayload
    );
    require!(
        encoded_operator
            == match market_operator {
                BooleanOperator::And => 0,
                BooleanOperator::Or => 1,
            },
        TutelaError::InvalidConditionPayload
    );

    let mut aggregate = market_operator == BooleanOperator::And;
    for _ in 0..encoded_count {
        let result = evaluate_encoded_condition(&mut cursor, stats)?;
        aggregate = match market_operator {
            BooleanOperator::And => aggregate && result,
            BooleanOperator::Or => aggregate || result,
        };
    }
    require!(cursor.finished(), TutelaError::InvalidConditionPayload);
    Ok(aggregate)
}

fn evaluate_encoded_condition(
    cursor: &mut ConditionCursor<'_>,
    stats: &[StatLeaf],
) -> Result<bool> {
    let field = cursor.u8()?;
    let operator = cursor.u8()?;
    let scope = cursor.u8()?;
    let _team_id = cursor.string()?;
    let _player_id = cursor.string()?;
    require!(
        scope == 0 || scope == 4,
        TutelaError::InvalidConditionPayload
    );

    let value_kind = cursor.u8()?;
    match field {
        0 => {
            require!(
                operator == 0 && value_kind == 2,
                TutelaError::InvalidConditionPayload
            );
            let expected = cursor.string()?.to_ascii_uppercase();
            let home = stat_value(stats, 1)?;
            let away = stat_value(stats, 2)?;
            let actual = if home > away {
                "HOME"
            } else if away > home {
                "AWAY"
            } else {
                "DRAW"
            };
            Ok(actual == expected)
        }
        1 | 4 | 6 => {
            require!(value_kind == 1, TutelaError::InvalidConditionPayload);
            let expected = i32::from(cursor.u16()?);
            let actual = match field {
                1 => checked_stat_sum(stats, &[1, 2])?,
                4 => checked_stat_sum(stats, &[7, 8])?,
                6 => checked_stat_sum(stats, &[3, 4, 5, 6])?,
                _ => unreachable!(),
            };
            compare_i32(actual, expected, operator)
        }
        8 => {
            require!(value_kind == 0, TutelaError::InvalidConditionPayload);
            let expected = cursor.u8()? != 0;
            let actual = stat_value(stats, 1)? > 0 && stat_value(stats, 2)? > 0;
            compare_bool(actual, expected, operator)
        }
        _ => err!(TutelaError::InvalidConditionPayload),
    }
}

fn stat_value(stats: &[StatLeaf], key: u32) -> Result<i32> {
    stats
        .iter()
        .find(|leaf| leaf.stat.key == key)
        .map(|leaf| leaf.stat.value)
        .ok_or(error!(TutelaError::RequiredStatMissing))
}

fn checked_stat_sum(stats: &[StatLeaf], keys: &[u32]) -> Result<i32> {
    keys.iter().try_fold(0i32, |sum, key| {
        sum.checked_add(stat_value(stats, *key)?)
            .ok_or(error!(TutelaError::MathOverflow))
    })
}

fn compare_i32(actual: i32, expected: i32, operator: u8) -> Result<bool> {
    match operator {
        0 => Ok(actual == expected),
        1 => Ok(actual != expected),
        2 => Ok(actual > expected),
        3 => Ok(actual >= expected),
        4 => Ok(actual < expected),
        5 => Ok(actual <= expected),
        _ => err!(TutelaError::InvalidConditionPayload),
    }
}

fn compare_bool(actual: bool, expected: bool, operator: u8) -> Result<bool> {
    match operator {
        0 => Ok(actual == expected),
        1 => Ok(actual != expected),
        6 => Ok(actual),
        7 => Ok(!actual),
        _ => err!(TutelaError::InvalidConditionPayload),
    }
}

struct ConditionCursor<'a> {
    bytes: &'a [u8],
    offset: usize,
}

impl<'a> ConditionCursor<'a> {
    fn new(bytes: &'a [u8]) -> Self {
        Self { bytes, offset: 0 }
    }

    fn u8(&mut self) -> Result<u8> {
        let value = *self
            .bytes
            .get(self.offset)
            .ok_or(error!(TutelaError::InvalidConditionPayload))?;
        self.offset += 1;
        Ok(value)
    }

    fn u16(&mut self) -> Result<u16> {
        let low = self.u8()?;
        let high = self.u8()?;
        Ok(u16::from_le_bytes([low, high]))
    }

    fn string(&mut self) -> Result<String> {
        let length = usize::from(self.u16()?);
        let end = self
            .offset
            .checked_add(length)
            .ok_or(error!(TutelaError::InvalidConditionPayload))?;
        let slice = self
            .bytes
            .get(self.offset..end)
            .ok_or(error!(TutelaError::InvalidConditionPayload))?;
        self.offset = end;
        String::from_utf8(slice.to_vec()).map_err(|_| error!(TutelaError::InvalidConditionPayload))
    }

    fn finished(&self) -> bool {
        self.offset == self.bytes.len()
    }
}

fn fixed_title(title: String) -> [u8; MARKET_TITLE_BYTES] {
    let mut out = [0u8; MARKET_TITLE_BYTES];
    let bytes = title.as_bytes();
    let len = bytes.len().min(MARKET_TITLE_BYTES);
    out[..len].copy_from_slice(&bytes[..len]);
    out
}

fn sha256(bytes: &[u8]) -> [u8; 32] {
    Sha256::digest(bytes).into()
}

fn checked_add_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_add(b).ok_or(error!(TutelaError::MathOverflow))
}

fn checked_sub_u64(a: u64, b: u64) -> Result<u64> {
    a.checked_sub(b).ok_or(error!(TutelaError::MathOverflow))
}

fn fee(total: u64, bps: u16) -> Result<u64> {
    Ok(((total as u128)
        .checked_mul(bps as u128)
        .ok_or(error!(TutelaError::MathOverflow))?
        .checked_div(BPS_DENOMINATOR)
        .ok_or(error!(TutelaError::MathOverflow))?) as u64)
}

#[cfg(test)]
mod security_tests {
    use super::*;

    const FIXTURE_ID: i64 = 18_257_865;
    const FINAL_TS: i64 = 1_784_415_600_000;

    fn final_payload(values: &[(u32, i32)]) -> StatValidationInput {
        StatValidationInput {
            ts: FINAL_TS,
            fixture_summary: ScoresBatchSummary {
                fixture_id: FIXTURE_ID,
                update_stats: ScoresUpdateStats {
                    update_count: 1,
                    min_timestamp: FINAL_TS,
                    max_timestamp: FINAL_TS,
                },
                events_sub_tree_root: [7; 32],
            },
            fixture_proof: vec![],
            main_tree_proof: vec![],
            event_stat_root: [8; 32],
            stats: values
                .iter()
                .map(|(key, value)| StatLeaf {
                    stat: ScoreStat {
                        key: *key,
                        value: *value,
                        period: FINAL_PERIOD,
                    },
                    stat_proof: vec![],
                })
                .collect(),
        }
    }

    fn numeric_condition(field: u8, operator: u8, value: u16) -> Vec<u8> {
        let mut bytes = vec![field, operator, 0, 0, 0, 0, 0, 1];
        bytes.extend_from_slice(&value.to_le_bytes());
        bytes
    }

    #[test]
    fn evaluates_stored_and_or_conditions_from_authenticated_stats() {
        let stats = final_payload(&[
            (1, 2),
            (2, 1),
            (3, 1),
            (4, 1),
            (5, 0),
            (6, 0),
            (7, 6),
            (8, 4),
        ]);
        let mut and_bytes = vec![0, 2];
        and_bytes.extend(numeric_condition(1, 3, 3));
        and_bytes.extend(numeric_condition(4, 4, 12));
        assert!(
            evaluate_condition_payload(&and_bytes, BooleanOperator::And, 2, &stats.stats).unwrap()
        );

        let mut or_bytes = vec![1, 2];
        or_bytes.extend(numeric_condition(1, 2, 10));
        or_bytes.extend(numeric_condition(4, 0, 10));
        assert!(
            evaluate_condition_payload(&or_bytes, BooleanOperator::Or, 2, &stats.stats).unwrap()
        );
    }

    #[test]
    fn rejects_wrong_fixture() {
        let payload = final_payload(&[(1, 2), (2, 1)]);
        let hash = sha256(&payload.try_to_vec().unwrap());
        assert!(validate_payload_binding(FIXTURE_ID + 1, 0, hash, &payload).is_err());
    }

    #[test]
    fn rejects_altered_statistics_after_submission() {
        let original = final_payload(&[(1, 2), (2, 1)]);
        let submitted_hash = sha256(&original.try_to_vec().unwrap());
        let altered = final_payload(&[(1, 9), (2, 1)]);
        assert!(validate_payload_binding(FIXTURE_ID, 0, submitted_hash, &altered).is_err());
    }

    #[test]
    fn rejects_replayed_validation() {
        assert!(ensure_proof_submitted(VerificationStatus::Submitted).is_ok());
        assert!(ensure_proof_submitted(VerificationStatus::Verified).is_err());
    }

    #[test]
    fn strategy_authenticates_every_stat_exactly_once() {
        let payload = final_payload(&[(1, 2), (2, 1), (7, 6)]);
        let strategy = exact_stat_strategy(&payload.stats).unwrap();
        assert_eq!(strategy.discrete_predicates.len(), payload.stats.len());
        for (index, predicate) in strategy.discrete_predicates.iter().enumerate() {
            match predicate {
                StatPredicate::Single {
                    index: actual,
                    predicate,
                } => {
                    assert_eq!(usize::from(*actual), index);
                    assert_eq!(predicate.threshold, payload.stats[index].stat.value);
                    assert_eq!(predicate.comparison, Comparison::EqualTo);
                }
                _ => panic!("exact strategy must use single-stat predicates"),
            }
        }
    }

    #[test]
    fn rejects_forged_or_wrong_program_validation_returns() {
        let verifier = TXLINE_DEVNET_PROGRAM_ID;
        assert!(validate_txline_return(verifier, verifier, &[0]).is_err());
        assert!(validate_txline_return(Pubkey::new_unique(), verifier, &[1]).is_err());
        assert!(validate_txline_return(verifier, verifier, &[1]).is_ok());
    }
}
