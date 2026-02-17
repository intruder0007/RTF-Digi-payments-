const GraphDetector = require('../detectors/graphDetector');
const MLFraudScorer = require('../ml/scorer');
const BiometricAnalyzer = require('../biometric/biometricAnalyzer');
const CacheManager = require('../utils/cacheManager');

class FraudEngine {
  constructor() {
    this.graphDetector = new GraphDetector({ windowHours: 24, minRingSize: 3 });
    this.mlScorer = new MLFraudScorer();
    this.biometric = new BiometricAnalyzer();
    this.cache = new CacheManager();
  }

  async analyzeTransaction(txn) {
    const start = Date.now();

    const mlScore = await this.mlScorer.score(txn).catch(() => 0.5);
    const graphScore = this._graphAnalysis(txn);
    const biometricScore = this._biometricAnalysis(txn);

    const fraudProbability = Math.min(
      1,
      (0.5 * mlScore) + (0.3 * graphScore) + (0.2 * biometricScore)
    );

    const isFraud = fraudProbability >= 0.8;
    const latencyMs = Date.now() - start;

    // Update history/cache
    this.cache.updateUserHistory(txn.sender_id, txn);
    this.cache.updateUserHistory(txn.receiver_id, txn);

    return {
      transaction_id: txn.transaction_id,
      fraud_probability: Number(fraudProbability.toFixed(4)),
      ml_score: Number((mlScore || 0).toFixed(4)),
      graph_score: Number((graphScore || 0).toFixed(4)),
      biometric_score: Number((biometricScore || 0).toFixed(4)),
      is_fraudulent: isFraud,
      latency_ms: latencyMs,
      reason: isFraud ? 'See component scores' : null
    };
  }

  _graphAnalysis(txn) {
    this.graphDetector.addTransaction(txn.sender_id, txn.receiver_id, txn.amount, new Date(txn.timestamp));
    return this.graphDetector.detectFraudRing(txn.sender_id, txn.receiver_id);
  }

  _biometricAnalysis(txn) {
    if (!txn.biometric) return 0.5;
    const score = this.biometric.calculateAnomalyScore(txn.sender_id, txn.biometric);
    this.biometric.updateProfile(txn.sender_id, txn.biometric);
    return score;
  }
}

module.exports = FraudEngine;
