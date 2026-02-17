/**
 * Minimal Transaction and Biometric shapes (no runtime validation library required).
 */

// Example shape documented for consumers
// { transaction_id, sender_id, receiver_id, amount, timestamp, device_id, ip_address, biometric }

module.exports = {
  TransactionSchema: {
    required: ['transaction_id', 'sender_id', 'receiver_id', 'amount', 'timestamp']
  }
};
