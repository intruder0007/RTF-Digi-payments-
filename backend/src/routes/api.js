const express = require('express');
const router = express.Router();
const FraudEngine = require('../services/fraudEngine');
const { TransactionSchema } = require('../models/transaction');

const engine = new FraudEngine();

router.post('/analyze', async (req, res) => {
  try {
    const payload = req.body;
    // Minimal validation
    if (!payload || !payload.transaction_id) return res.status(400).json({ error: 'invalid payload' });

    const result = await engine.analyzeTransaction(payload);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
