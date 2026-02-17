class GraphFraudDetector {
  constructor({ windowHours = 24, minRingSize = 3 } = {}) {
    this.windowHours = windowHours;
    this.minRingSize = minRingSize;
    this.adj = new Map();
    this.txTimes = new Map();
  }

  addTransaction(sender, receiver, amount, timestamp) {
    if (!this.adj.has(sender)) this.adj.set(sender, new Set());
    this.adj.get(sender).add(receiver);

    if (!this.txTimes.has(sender)) this.txTimes.set(sender, []);
    this.txTimes.get(sender).push(timestamp);
    // naive cleanup not implemented
  }

  detectFraudRing(sender, receiver) {
    // Simple cycle detection limited neighborhood
    const visited = new Set();
    const stack = [];

    const dfs = (node) => {
      if (visited.has(node)) return false;
      visited.add(node);
      stack.push(node);
      const neighbors = this.adj.get(node) || new Set();
      for (const n of neighbors) {
        if (n === sender && stack.length >= this.minRingSize) return true;
        if (!visited.has(n) && dfs(n)) return true;
      }
      stack.pop();
      return false;
    };

    const hasCycle = dfs(sender);
    if (hasCycle) return 0.9;

    // velocity heuristic
    const times = this.txTimes.get(sender) || [];
    const recent = times.filter(t => (Date.now() - new Date(t).getTime()) < 3600 * 1000);
    if (recent.length > 10) return Math.min(recent.length / 20, 1.0);
    return 0.0;
  }
}

module.exports = GraphFraudDetector;
