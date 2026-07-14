console.log(JSON.stringify({
  demo: "refund",
  steps: [
    "Create market with final-data deadline",
    "Lock market",
    "Do not submit valid proof before refund eligibility",
    "Anyone triggers refund eligibility",
    "Each participant claims exact principal"
  ],
  fees: "No creator or protocol fees are charged on refund paths."
}, null, 2));
