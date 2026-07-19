/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/tutela.json`.
 */
export type Tutela = {
  "address": "GPhEqiNUU86oYW53NGUcS4DfZNCcYimiZuM5jaXwf1rG",
  "metadata": {
    "name": "tutela",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Tutela devnet parametric football markets"
  },
  "instructions": [
    {
      "name": "cancelMarket",
      "discriminator": [
        205,
        121,
        84,
        210,
        222,
        71,
        150,
        11
      ],
      "accounts": [
        {
          "name": "creator",
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "claimPayout",
      "discriminator": [
        127,
        240,
        132,
        62,
        227,
        198,
        146,
        133
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "relations": [
            "market"
          ]
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "ownerToken",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "claimRefund",
      "discriminator": [
        15,
        16,
        30,
        161,
        255,
        228,
        97,
        60
      ],
      "accounts": [
        {
          "name": "owner",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "relations": [
            "market"
          ]
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "ownerToken",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        }
      ],
      "args": []
    },
    {
      "name": "closeMarketAccounts",
      "discriminator": [
        139,
        214,
        115,
        217,
        119,
        119,
        157,
        18
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "createMarket",
      "discriminator": [
        103,
        226,
        97,
        235,
        200,
        188,
        251,
        254
      ],
      "accounts": [
        {
          "name": "creator",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocolConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "creatorProfile",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  99,
                  114,
                  101,
                  97,
                  116,
                  111,
                  114
                ]
              },
              {
                "kind": "account",
                "path": "creator"
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "vault",
          "writable": true,
          "signer": true
        },
        {
          "name": "collateralMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "createMarketArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initializeProtocol",
      "discriminator": [
        188,
        233,
        252,
        106,
        134,
        146,
        202,
        91
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocolConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "collateralMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "protocolFeeBps",
          "type": "u16"
        },
        {
          "name": "maxCreatorFeeBps",
          "type": "u16"
        },
        {
          "name": "minimumDeposit",
          "type": "u64"
        },
        {
          "name": "maximumDeposit",
          "type": "u64"
        },
        {
          "name": "maximumMarketCapacity",
          "type": "u32"
        },
        {
          "name": "verificationProgramId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "joinMarket",
      "discriminator": [
        141,
        113,
        87,
        152,
        182,
        213,
        41,
        202
      ],
      "accounts": [
        {
          "name": "user",
          "writable": true,
          "signer": true
        },
        {
          "name": "protocolConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "userToken",
          "writable": true
        },
        {
          "name": "vault",
          "writable": true,
          "relations": [
            "market"
          ]
        },
        {
          "name": "position",
          "writable": true
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "side",
          "type": {
            "defined": {
              "name": "side"
            }
          }
        },
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "lockMarket",
      "discriminator": [
        107,
        8,
        184,
        91,
        223,
        13,
        180,
        38
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "pauseProtocol",
      "discriminator": [
        144,
        95,
        0,
        107,
        119,
        39,
        248,
        141
      ],
      "accounts": [
        {
          "name": "protocolConfig",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "protocolConfig"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "settleMarket",
      "discriminator": [
        193,
        153,
        95,
        216,
        166,
        6,
        144,
        217
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "proof",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  111,
                  102
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "submitProof",
      "discriminator": [
        54,
        241,
        46,
        84,
        4,
        212,
        46,
        94
      ],
      "accounts": [
        {
          "name": "submitter",
          "writable": true,
          "signer": true
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "proof",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  111,
                  102
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "proofArgs"
            }
          }
        }
      ]
    },
    {
      "name": "triggerRefundEligibility",
      "discriminator": [
        85,
        51,
        84,
        125,
        166,
        201,
        168,
        202
      ],
      "accounts": [
        {
          "name": "market",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "unpauseProtocol",
      "discriminator": [
        183,
        154,
        5,
        183,
        105,
        76,
        87,
        18
      ],
      "accounts": [
        {
          "name": "protocolConfig",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "protocolConfig"
          ]
        }
      ],
      "args": []
    },
    {
      "name": "updateProtocolConfig",
      "discriminator": [
        197,
        97,
        123,
        54,
        221,
        168,
        11,
        135
      ],
      "accounts": [
        {
          "name": "protocolConfig",
          "writable": true
        },
        {
          "name": "admin",
          "signer": true,
          "relations": [
            "protocolConfig"
          ]
        }
      ],
      "args": [
        {
          "name": "protocolFeeBps",
          "type": "u16"
        },
        {
          "name": "maxCreatorFeeBps",
          "type": "u16"
        },
        {
          "name": "minimumDeposit",
          "type": "u64"
        },
        {
          "name": "maximumDeposit",
          "type": "u64"
        },
        {
          "name": "maximumMarketCapacity",
          "type": "u32"
        },
        {
          "name": "verificationProgramId",
          "type": "pubkey"
        }
      ]
    },
    {
      "name": "validateOutcome",
      "discriminator": [
        29,
        203,
        125,
        138,
        197,
        125,
        152,
        60
      ],
      "accounts": [
        {
          "name": "protocolConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  116,
                  111,
                  99,
                  111,
                  108
                ]
              }
            ]
          }
        },
        {
          "name": "market",
          "writable": true
        },
        {
          "name": "proof",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  114,
                  111,
                  111,
                  102
                ]
              },
              {
                "kind": "account",
                "path": "market"
              }
            ]
          }
        },
        {
          "name": "txlineProgram",
          "address": "6pW64gN1s2uqjHkn1unFeEjAwJkPGHoppGvS715wyP2J"
        },
        {
          "name": "dailyScoresMerkleRoots"
        }
      ],
      "args": [
        {
          "name": "payload",
          "type": {
            "defined": {
              "name": "statValidationInput"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "creatorProfile",
      "discriminator": [
        251,
        250,
        184,
        111,
        214,
        178,
        32,
        221
      ]
    },
    {
      "name": "market",
      "discriminator": [
        219,
        190,
        213,
        55,
        0,
        227,
        198,
        154
      ]
    },
    {
      "name": "position",
      "discriminator": [
        170,
        188,
        143,
        228,
        122,
        64,
        247,
        208
      ]
    },
    {
      "name": "proofSubmissionRecord",
      "discriminator": [
        207,
        228,
        54,
        145,
        30,
        215,
        119,
        163
      ]
    },
    {
      "name": "protocolConfig",
      "discriminator": [
        207,
        91,
        250,
        28,
        152,
        179,
        215,
        209
      ]
    }
  ],
  "events": [
    {
      "name": "marketCancelled",
      "discriminator": [
        139,
        163,
        33,
        168,
        19,
        180,
        81,
        170
      ]
    },
    {
      "name": "marketClosed",
      "discriminator": [
        86,
        91,
        119,
        43,
        94,
        0,
        217,
        113
      ]
    },
    {
      "name": "marketCreated",
      "discriminator": [
        88,
        184,
        130,
        231,
        226,
        84,
        6,
        58
      ]
    },
    {
      "name": "marketInvalidated",
      "discriminator": [
        205,
        44,
        245,
        81,
        61,
        249,
        192,
        85
      ]
    },
    {
      "name": "marketLocked",
      "discriminator": [
        57,
        30,
        242,
        116,
        238,
        156,
        185,
        189
      ]
    },
    {
      "name": "marketSettled",
      "discriminator": [
        237,
        212,
        22,
        175,
        201,
        117,
        215,
        99
      ]
    },
    {
      "name": "outcomeVerified",
      "discriminator": [
        31,
        35,
        69,
        128,
        109,
        233,
        26,
        228
      ]
    },
    {
      "name": "payoutClaimed",
      "discriminator": [
        200,
        39,
        105,
        112,
        116,
        63,
        58,
        149
      ]
    },
    {
      "name": "proofRejected",
      "discriminator": [
        119,
        113,
        245,
        78,
        164,
        67,
        8,
        62
      ]
    },
    {
      "name": "proofSubmitted",
      "discriminator": [
        160,
        51,
        85,
        70,
        249,
        89,
        5,
        139
      ]
    },
    {
      "name": "protocolConfigUpdated",
      "discriminator": [
        20,
        99,
        32,
        237,
        111,
        86,
        195,
        199
      ]
    },
    {
      "name": "protocolInitialized",
      "discriminator": [
        173,
        122,
        168,
        254,
        9,
        118,
        76,
        132
      ]
    },
    {
      "name": "protocolPaused",
      "discriminator": [
        35,
        111,
        245,
        138,
        237,
        199,
        79,
        223
      ]
    },
    {
      "name": "protocolUnpaused",
      "discriminator": [
        248,
        204,
        112,
        239,
        72,
        67,
        127,
        216
      ]
    },
    {
      "name": "refundClaimed",
      "discriminator": [
        136,
        64,
        242,
        99,
        4,
        244,
        208,
        130
      ]
    },
    {
      "name": "refundEligible",
      "discriminator": [
        223,
        56,
        203,
        9,
        49,
        176,
        169,
        15
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "protocolPaused",
      "msg": "Protocol is paused for creation and deposits."
    },
    {
      "code": 6001,
      "name": "creatorFeeTooHigh",
      "msg": "Creator fee exceeds the hard cap."
    },
    {
      "code": 6002,
      "name": "invalidDepositBounds",
      "msg": "Deposit bounds are invalid."
    },
    {
      "code": 6003,
      "name": "invalidConditionCount",
      "msg": "Condition count is invalid."
    },
    {
      "code": 6004,
      "name": "conditionPayloadTooLarge",
      "msg": "Condition payload is too large."
    },
    {
      "code": 6005,
      "name": "invalidDeadline",
      "msg": "Deadline is invalid."
    },
    {
      "code": 6006,
      "name": "invalidState",
      "msg": "Market is in the wrong state."
    },
    {
      "code": 6007,
      "name": "deadlinePassed",
      "msg": "Participation deadline has passed."
    },
    {
      "code": 6008,
      "name": "deadlineNotReached",
      "msg": "Deadline has not been reached."
    },
    {
      "code": 6009,
      "name": "invalidDepositAmount",
      "msg": "Deposit amount is invalid."
    },
    {
      "code": 6010,
      "name": "marketCapacityReached",
      "msg": "Market capacity reached."
    },
    {
      "code": 6011,
      "name": "sideCannotChange",
      "msg": "A wallet cannot change side after depositing."
    },
    {
      "code": 6012,
      "name": "alreadyClaimed",
      "msg": "Position has already claimed."
    },
    {
      "code": 6013,
      "name": "matchMismatch",
      "msg": "Proof match id does not match market."
    },
    {
      "code": 6014,
      "name": "invalidProofTimestamp",
      "msg": "Proof timestamp is invalid."
    },
    {
      "code": 6015,
      "name": "duplicateProof",
      "msg": "A proof was already submitted."
    },
    {
      "code": 6016,
      "name": "refundPathAlreadyAvailable",
      "msg": "Refund path is already available."
    },
    {
      "code": 6017,
      "name": "invalidVerifier",
      "msg": "Verifier identity does not match protocol config."
    },
    {
      "code": 6018,
      "name": "verifierNotExecutable",
      "msg": "Configured verifier account is not executable."
    },
    {
      "code": 6019,
      "name": "invalidDailyRoot",
      "msg": "TxLINE daily scores root PDA is invalid."
    },
    {
      "code": 6020,
      "name": "invalidStatPayload",
      "msg": "TxLINE stat payload is malformed or unsupported."
    },
    {
      "code": 6021,
      "name": "nonFinalStatistics",
      "msg": "Settlement requires TxLINE final-period statistics."
    },
    {
      "code": 6022,
      "name": "statValidationFailed",
      "msg": "TxLINE CPI did not authenticate the supplied statistics."
    },
    {
      "code": 6023,
      "name": "invalidConditionPayload",
      "msg": "Stored condition bytes are malformed or unsupported on-chain."
    },
    {
      "code": 6024,
      "name": "requiredStatMissing",
      "msg": "A statistic required by the market conditions is missing."
    },
    {
      "code": 6025,
      "name": "proofPayloadMismatch",
      "msg": "Proof payload hash mismatch."
    },
    {
      "code": 6026,
      "name": "missingResult",
      "msg": "Verified result is missing."
    },
    {
      "code": 6027,
      "name": "authenticatedStatsMissing",
      "msg": "Settlement requires statistics authenticated by the verified TxLINE proof."
    },
    {
      "code": 6028,
      "name": "invalidWinningPool",
      "msg": "Winning pool is invalid."
    },
    {
      "code": 6029,
      "name": "notWinningPosition",
      "msg": "Position is not on the winning side."
    },
    {
      "code": 6030,
      "name": "unauthorized",
      "msg": "Unauthorized."
    },
    {
      "code": 6031,
      "name": "mathOverflow",
      "msg": "Math overflow."
    }
  ],
  "types": [
    {
      "name": "booleanOperator",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "and"
          },
          {
            "name": "or"
          }
        ]
      }
    },
    {
      "name": "createMarketArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "marketNonce",
            "type": {
              "array": [
                "u8",
                8
              ]
            }
          },
          {
            "name": "matchId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "txlineFixtureId",
            "type": "i64"
          },
          {
            "name": "title",
            "type": "string"
          },
          {
            "name": "booleanOperator",
            "type": {
              "defined": {
                "name": "booleanOperator"
              }
            }
          },
          {
            "name": "conditionCount",
            "type": "u8"
          },
          {
            "name": "conditionPayload",
            "type": "bytes"
          },
          {
            "name": "minimumDeposit",
            "type": "u64"
          },
          {
            "name": "maximumDeposit",
            "type": "u64"
          },
          {
            "name": "creatorFeeBps",
            "type": "u16"
          },
          {
            "name": "participationDeadline",
            "type": "i64"
          },
          {
            "name": "expectedMatchEndTimestamp",
            "type": "i64"
          },
          {
            "name": "refundEligibilityTimestamp",
            "type": "i64"
          },
          {
            "name": "claimDeadline",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "creatorProfile",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "marketsCreated",
            "type": "u64"
          },
          {
            "name": "validSettlements",
            "type": "u64"
          },
          {
            "name": "cancelledMarkets",
            "type": "u64"
          },
          {
            "name": "cumulativeCreatorFees",
            "type": "u64"
          },
          {
            "name": "rateLimitWindow",
            "type": "i64"
          },
          {
            "name": "rateLimitCount",
            "type": "u16"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "market",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "matchId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "title",
            "type": {
              "array": [
                "u8",
                96
              ]
            }
          },
          {
            "name": "booleanOperator",
            "type": {
              "defined": {
                "name": "booleanOperator"
              }
            }
          },
          {
            "name": "conditionCount",
            "type": "u8"
          },
          {
            "name": "conditionPayload",
            "type": "bytes"
          },
          {
            "name": "conditionHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "collateralMint",
            "type": "pubkey"
          },
          {
            "name": "vault",
            "type": "pubkey"
          },
          {
            "name": "yesPool",
            "type": "u64"
          },
          {
            "name": "noPool",
            "type": "u64"
          },
          {
            "name": "participantCount",
            "type": "u32"
          },
          {
            "name": "minimumDeposit",
            "type": "u64"
          },
          {
            "name": "maximumDeposit",
            "type": "u64"
          },
          {
            "name": "maximumCapacity",
            "type": "u32"
          },
          {
            "name": "creatorFeeBps",
            "type": "u16"
          },
          {
            "name": "protocolFeeBpsSnapshot",
            "type": "u16"
          },
          {
            "name": "participationDeadline",
            "type": "i64"
          },
          {
            "name": "expectedMatchEndTimestamp",
            "type": "i64"
          },
          {
            "name": "refundEligibilityTimestamp",
            "type": "i64"
          },
          {
            "name": "claimDeadline",
            "type": "i64"
          },
          {
            "name": "state",
            "type": {
              "defined": {
                "name": "marketState"
              }
            }
          },
          {
            "name": "verifiedResult",
            "type": {
              "option": {
                "defined": {
                  "name": "side"
                }
              }
            }
          },
          {
            "name": "createdTimestamp",
            "type": "i64"
          },
          {
            "name": "settledTimestamp",
            "type": "i64"
          },
          {
            "name": "creatorBond",
            "type": "u64"
          },
          {
            "name": "netPool",
            "type": "u64"
          },
          {
            "name": "protocolFeeAmount",
            "type": "u64"
          },
          {
            "name": "creatorFeeAmount",
            "type": "u64"
          },
          {
            "name": "bump",
            "type": "u8"
          },
          {
            "name": "vaultAuthorityBump",
            "type": "u8"
          },
          {
            "name": "txlineFixtureId",
            "type": "i64"
          },
          {
            "name": "validatedStatHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "marketCancelled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "marketClosed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "marketCreated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "creator",
            "type": "pubkey"
          },
          {
            "name": "matchId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "conditionHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "marketInvalidated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "marketLocked",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "marketSettled",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "winningSide",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          },
          {
            "name": "netPool",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "marketState",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "draft"
          },
          {
            "name": "open"
          },
          {
            "name": "locked"
          },
          {
            "name": "awaitingResult"
          },
          {
            "name": "proofSubmitted"
          },
          {
            "name": "verified"
          },
          {
            "name": "settled"
          },
          {
            "name": "refundEligible"
          },
          {
            "name": "refunded"
          },
          {
            "name": "cancelled"
          },
          {
            "name": "invalid"
          },
          {
            "name": "closed"
          }
        ]
      }
    },
    {
      "name": "outcomeVerified",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "winningSide",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          }
        ]
      }
    },
    {
      "name": "payoutClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "position",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "side",
            "type": {
              "defined": {
                "name": "side"
              }
            }
          },
          {
            "name": "depositedAmount",
            "type": "u64"
          },
          {
            "name": "claimed",
            "type": "bool"
          },
          {
            "name": "creatorPosition",
            "type": "bool"
          },
          {
            "name": "depositedTimestamp",
            "type": "i64"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proofArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "proofHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "matchId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "finalizationTimestamp",
            "type": "i64"
          },
          {
            "name": "statPayloadHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "proofNode",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "hash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "isRightSibling",
            "type": "bool"
          }
        ]
      }
    },
    {
      "name": "proofRejected",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "proofSubmissionRecord",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "submittedBy",
            "type": "pubkey"
          },
          {
            "name": "submittedTimestamp",
            "type": "i64"
          },
          {
            "name": "proofHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "matchId",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "finalizationTimestamp",
            "type": "i64"
          },
          {
            "name": "verificationStatus",
            "type": {
              "defined": {
                "name": "verificationStatus"
              }
            }
          },
          {
            "name": "statPayloadHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "proofSubmitted",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "submittedBy",
            "type": "pubkey"
          },
          {
            "name": "proofHash",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "protocolConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "paused",
            "type": "bool"
          },
          {
            "name": "protocolFeeBps",
            "type": "u16"
          },
          {
            "name": "maxCreatorFeeBps",
            "type": "u16"
          },
          {
            "name": "maxConditions",
            "type": "u8"
          },
          {
            "name": "minimumDeposit",
            "type": "u64"
          },
          {
            "name": "maximumDeposit",
            "type": "u64"
          },
          {
            "name": "maximumMarketCapacity",
            "type": "u32"
          },
          {
            "name": "allowedCollateralMint",
            "type": "pubkey"
          },
          {
            "name": "verificationProgramId",
            "type": "pubkey"
          },
          {
            "name": "version",
            "type": "u8"
          },
          {
            "name": "bump",
            "type": "u8"
          }
        ]
      }
    },
    {
      "name": "protocolConfigUpdated",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "protocolFeeBps",
            "type": "u16"
          },
          {
            "name": "maxCreatorFeeBps",
            "type": "u16"
          }
        ]
      }
    },
    {
      "name": "protocolInitialized",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          },
          {
            "name": "collateralMint",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "protocolPaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "protocolUnpaused",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "refundClaimed",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          },
          {
            "name": "owner",
            "type": "pubkey"
          },
          {
            "name": "amount",
            "type": "u64"
          }
        ]
      }
    },
    {
      "name": "refundEligible",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "market",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "scoreStat",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "key",
            "type": "u32"
          },
          {
            "name": "value",
            "type": "i32"
          },
          {
            "name": "period",
            "type": "i32"
          }
        ]
      }
    },
    {
      "name": "scoresBatchSummary",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "fixtureId",
            "type": "i64"
          },
          {
            "name": "updateStats",
            "type": {
              "defined": {
                "name": "scoresUpdateStats"
              }
            }
          },
          {
            "name": "eventsSubTreeRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          }
        ]
      }
    },
    {
      "name": "scoresUpdateStats",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "updateCount",
            "type": "i32"
          },
          {
            "name": "minTimestamp",
            "type": "i64"
          },
          {
            "name": "maxTimestamp",
            "type": "i64"
          }
        ]
      }
    },
    {
      "name": "side",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "yes"
          },
          {
            "name": "no"
          }
        ]
      }
    },
    {
      "name": "statLeaf",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "stat",
            "type": {
              "defined": {
                "name": "scoreStat"
              }
            }
          },
          {
            "name": "statProof",
            "type": {
              "vec": {
                "defined": {
                  "name": "proofNode"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "statValidationInput",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "ts",
            "type": "i64"
          },
          {
            "name": "fixtureSummary",
            "type": {
              "defined": {
                "name": "scoresBatchSummary"
              }
            }
          },
          {
            "name": "fixtureProof",
            "type": {
              "vec": {
                "defined": {
                  "name": "proofNode"
                }
              }
            }
          },
          {
            "name": "mainTreeProof",
            "type": {
              "vec": {
                "defined": {
                  "name": "proofNode"
                }
              }
            }
          },
          {
            "name": "eventStatRoot",
            "type": {
              "array": [
                "u8",
                32
              ]
            }
          },
          {
            "name": "stats",
            "type": {
              "vec": {
                "defined": {
                  "name": "statLeaf"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "verificationStatus",
      "type": {
        "kind": "enum",
        "variants": [
          {
            "name": "submitted"
          },
          {
            "name": "verified"
          },
          {
            "name": "rejected"
          }
        ]
      }
    }
  ]
};
