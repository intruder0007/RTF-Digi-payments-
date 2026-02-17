const redis = require('redis');

class CacheManager {
  constructor() {
    try {
      this.client = redis.createClient();
      this.client.connect().catch(() => {});
      this.useRedis = true;
    } catch (e) {
      this.useRedis = false;
      this.cache = {};
    }
  }

  async getUserHistory(userId) {
    const key = `user:${userId}:history`;
    if (this.useRedis && this.client) {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : this._defaultHistory();
    }
    return this.cache[key] || this._defaultHistory();
  }

  async updateUserHistory(userId, txn) {
    const key = `user:${userId}:history`;
    const history = await this.getUserHistory(userId);
    history.txn_count = (history.txn_count || 0) + 1;
    history.device_changed = history.last_device !== txn.device_id;
    history.ip_changed = history.last_ip !== txn.ip_address;
    history.last_device = txn.device_id;
    history.last_ip = txn.ip_address;
    history.last_txn_time = txn.timestamp;

    if (this.useRedis && this.client) {
      await this.client.set(key, JSON.stringify(history), { EX: 3600 }).catch(() => {});
    } else {
      this.cache[key] = history;
    }
    return history;
  }

  _defaultHistory() {
    return { txn_count: 0, last_device: null, last_ip: null, amount_velocity: 0, last_txn_time: null };
  }
}

module.exports = CacheManager;
