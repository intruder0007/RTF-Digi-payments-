const ort = require('onnxruntime-node');
const path = require('path');

class MLFraudScorer {
  constructor(modelPath = null) {
    this.session = null;
    this.modelPath = modelPath || path.join(__dirname, '..', '..', 'models', 'fraud_model.onnx');
    this._init();
  }

  async _init() {
    try {
      this.session = await ort.InferenceSession.create(this.modelPath);
    } catch (e) {
      // model not available — fall back to heuristic
      this.session = null;
    }
  }

  async score(txn) {
    // If ONNX model loaded, run inference; else use heuristic
    if (this.session) {
      // Note: inputs must match exported model feature order
      const features = this._extractFeatures(txn);
      const tensor = new ort.Tensor('float32', Float32Array.from(features), [1, features.length]);
      const feeds = { input: tensor };
      const results = await this.session.run(feeds);
      const out = results.probability || Object.values(results)[0];
      return out.data ? out.data[out.data.length - 1] : Number(out[1]);
    }

    return this._heuristicScore(txn);
  }

  _extractFeatures(txn) {
    const amount = txn.amount || 0;
    const date = new Date(txn.timestamp || Date.now());
    return [
      amount,
      date.getHours(),
      date.getDay(),
      Math.log1p(amount),
      0, // sender_txn_count (not available in scorer)
      0, // receiver_txn_count
      0, // amount_velocity
      0, // device_change
      0  // ip_change
    ];
  }

  _heuristicScore(txn) {
    let score = 0;
    const amount = txn.amount || 0;
    const hour = new Date(txn.timestamp || Date.now()).getHours();
    if (amount > 50000) score += 0.3;
    if (hour < 5) score += 0.2;
    return Math.min(1, score);
  }
}

module.exports = MLFraudScorer;
