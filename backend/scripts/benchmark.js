const FraudEngine = require('../src/services/fraudEngine');

async function run() {
  const engine = new FraudEngine();
  const start = Date.now();
  const N = 50;
  for (let i = 0; i < N; i++) {
    const txn = {
      transaction_id: `BM_${i}`,
      sender_id: `S_${i % 5}`,
      receiver_id: `R_${i}`,
      amount: Math.round(Math.random() * 10000),
      timestamp: new Date().toISOString(),
      device_id: `DEV_${i}`,
      ip_address: `10.0.0.${i}`
    };
    await engine.analyzeTransaction(txn);
  }
  const ms = Date.now() - start;
  console.log(`Processed ${N} transactions in ${ms} ms (~${(ms / N).toFixed(2)} ms/txn)`);
}

if (require.main === module) run();
