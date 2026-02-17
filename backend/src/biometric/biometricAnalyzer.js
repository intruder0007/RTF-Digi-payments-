class BiometricAnalyzer {
  constructor() {
    this.userProfiles = new Map();
  }

  updateProfile(userId, biometric) {
    if (!this.userProfiles.has(userId)) {
      this.userProfiles.set(userId, { typing_speed: [], swipe_velocity: [], pressure_pattern: [], device_angle: [] });
    }
    const profile = this.userProfiles.get(userId);
    ['typing_speed', 'swipe_velocity', 'pressure_pattern', 'device_angle'].forEach(k => {
      if (biometric[k] != null) {
        profile[k].push(biometric[k]);
        if (profile[k].length > 100) profile[k] = profile[k].slice(-100);
      }
    });
  }

  calculateAnomalyScore(userId, current) {
    if (!this.userProfiles.has(userId)) return 0.5;
    const profile = this.userProfiles.get(userId);
    const scores = [];
    ['typing_speed', 'swipe_velocity', 'pressure_pattern', 'device_angle'].forEach(k => {
      if (current[k] != null && profile[k].length >= 5) {
        const mean = profile[k].reduce((a,b)=>a+b,0)/profile[k].length;
        const std = Math.sqrt(profile[k].map(x=>Math.pow(x-mean,2)).reduce((a,b)=>a+b,0)/profile[k].length);
        if (std === 0) scores.push(Math.abs(current[k]-mean) < 0.01 ? 0.0 : 1.0);
        else {
          const z = Math.abs((current[k]-mean)/std);
          if (z>3) scores.push(0.95); else if (z>2) scores.push(0.75); else if (z>1) scores.push(0.4); else scores.push(0.1);
        }
      }
    });
    if (scores.length === 0) return 0.5;
    return scores.reduce((a,b)=>a+b,0)/scores.length;
  }
}

module.exports = BiometricAnalyzer;
