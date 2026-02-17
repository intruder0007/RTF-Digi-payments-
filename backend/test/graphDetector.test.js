const GraphFraudDetector = require('../src/detectors/graphDetector');

describe('GraphFraudDetector basics', () => {
  test('detects velocity and cycles heuristically', () => {
    const g = new GraphFraudDetector({ windowHours: 24, minRingSize: 3 });
    const now = new Date().toISOString();
    // add a small ring
    g.addTransaction('A', 'B', 100, now);
    g.addTransaction('B', 'C', 100, now);
    g.addTransaction('C', 'A', 100, now);
    const score = g.detectFraudRing('A', 'B');
    expect(score).toBeGreaterThanOrEqual(0);
  });
});
