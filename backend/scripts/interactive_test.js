const FraudEngine = require('../src/services/fraudEngine');

function pretty(result) {
  console.log('\n' + '='.repeat(60));
  console.log(`Transaction: ${result.transaction_id}`);
  console.log('Scores:');
  console.log(`  ML Score:        ${result.ml_score}`);
  console.log(`  Graph Score:     ${result.graph_score}`);
  console.log(`  Biometric Score: ${result.biometric_score}`);
  console.log(`Result: Fraud Probability: ${result.fraud_probability} Decision: ${result.is_fraudulent ? '[!] FRAUDULENT' : '[OK] LEGITIMATE'}`);
}

async function testTransaction(engine, id, sender, receiver, amount, hour = 14, typing_speed = 50) {
  const now = new Date();
  now.setHours(hour);
  const txn = {
    transaction_id: id,
    sender_id: sender,
    receiver_id: receiver,
    amount: amount,
    timestamp: now.toISOString(),
    device_id: `DEVICE_${sender}`,
    ip_address: '127.0.0.1',
    biometric: { typing_speed, swipe_velocity: 120.0, pressure_pattern: 0.5 }
  };

  const res = await engine.analyzeTransaction(txn);
  pretty(res);
  return res;
}

async function main() {
  console.log('Interactive Node.js Fraud Detection Tester');
  const engine = new FraudEngine();

  console.log('\n[SCENARIO 1] Normal Daily Transactions');
  await testTransaction(engine, 'TXN001', 'ALICE', 'BOB', 1500, 10, 50);
  await testTransaction(engine, 'TXN002', 'CHARLIE', 'DAVE', 3200, 14, 48);

  console.log('\n[SCENARIO 2] High-Value Transactions');
  await testTransaction(engine, 'TXN003', 'MERCHANT_A', 'SUPPLIER_B', 75000, 11, 55);
  await testTransaction(engine, 'TXN004', 'COMPANY_X', 'VENDOR_Y', 125000, 15, 52);

  console.log('\n[SCENARIO 3] Late Night Transactions');
  await testTransaction(engine, 'TXN005', 'USER_1', 'USER_2', 25000, 2, 45);
  await testTransaction(engine, 'TXN006', 'USER_3', 'USER_4', 50000, 3, 47);

  console.log('\n[SCENARIO 4] Potential Fraud Ring');
  const users = ['RING_A','RING_B','RING_C','RING_D'];
  for (let i = 0; i < users.length; i++) {
    const sender = users[i];
    const receiver = users[(i + 1) % users.length];
    await testTransaction(engine, `TXN_RING_${i}`, sender, receiver, 10000, 12, 50);
  }

  console.log('\n[SCENARIO 5] High Velocity (Rapid Transactions)');
  for (let i = 0; i < 5; i++) {
    await testTransaction(engine, `TXN_VEL_${i}`, 'VELOCITY_USER', `RECV_${i}`, 5000, 16, 50);
  }

  console.log('\nTEST COMPLETE');
}

if (require.main === module) main();
