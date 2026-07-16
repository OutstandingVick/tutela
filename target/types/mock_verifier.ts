/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/mock_verifier.json`.
 */
export type MockVerifier = {
  "address": "8fRo2KWuFW4r9EBKVNKBN6AvzszFMU7hd6p9EXcCEGxv",
  "metadata": {
    "name": "mockVerifier",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Labelled mock verifier for Tutela devnet demos"
  },
  "instructions": [
    {
      "name": "attestMockProof",
      "discriminator": [
        220,
        49,
        179,
        216,
        89,
        30,
        161,
        192
      ],
      "accounts": [
        {
          "name": "attester",
          "signer": true
        }
      ],
      "args": [
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
  ],
  "events": [
    {
      "name": "mockProofAttested",
      "discriminator": [
        121,
        218,
        254,
        193,
        242,
        137,
        110,
        56
      ]
    }
  ],
  "types": [
    {
      "name": "mockProofAttested",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "attester",
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
    }
  ]
};
