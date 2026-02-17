const MLFraudScorer = require('../src/ml/scorer');

describe('MLFraudScorer heuristic fallback', () => {
  test('returns moderate score for unknown model (heuristic)', async () => {
    const scorer = new MLFraudScorer('/non/existent/model.onnx');
    // allow init to complete
    await new Promise(r => setTimeout(r, 100));
    const txn = { amount: 60000, timestamp: new Date().toISOString() };
    const score = await scorer.score(txn);
    expect(score).toBeGreaterThan(0);
    expect(score).toBeLessThanOrEqual(1);
  });
});
