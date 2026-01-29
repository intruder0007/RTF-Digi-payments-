let totalScanned = 0;

// Form submission
document.getElementById('transaction-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const transaction = {
        transaction_id: document.getElementById('txn-id').value,
        sender_id: document.getElementById('sender').value,
        receiver_id: document.getElementById('receiver').value,
        amount: parseFloat(document.getElementById('amount').value),
        timestamp: new Date().toISOString(),
        device_id: document.getElementById('device').value,
        ip_address: document.getElementById('ip').value
    };
    
    try {
        const response = await fetch('/api/v1/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(transaction)
        });
        
        const result = await response.json();
        displayResults(result);
        updateStats();
    } catch (error) {
        console.error('Error:', error);
        alert('Error analyzing transaction. Make sure the API server is running.');
    }
});

function displayResults(result) {
    const resultsCard = document.getElementById('results-card');
    resultsCard.style.display = 'block';
    
    // Status
    const statusEl = document.getElementById('result-status');
    if (result.is_fraudulent) {
        statusEl.textContent = '🚨 FRAUDULENT';
        statusEl.className = 'result-status fraud';
    } else {
        statusEl.textContent = '✓ LEGITIMATE';
        statusEl.className = 'result-status safe';
    }
    
    // Probability
    const probEl = document.getElementById('result-probability');
    probEl.textContent = (result.fraud_probability * 100).toFixed(1) + '%';
    probEl.style.color = result.is_fraudulent ? 'var(--danger)' : 'var(--success)';
    
    // Scores
    updateScore('ml-score', result.ml_score);
    updateScore('graph-score', result.graph_score);
    updateScore('bio-score', result.biometric_score);
    
    // Details
    document.getElementById('result-latency').textContent = result.latency_ms.toFixed(2) + 'ms';
    document.getElementById('result-txn-id').textContent = result.transaction_id;
    
    // Reason
    const reasonItem = document.getElementById('reason-item');
    if (result.reason) {
        reasonItem.style.display = 'flex';
        document.getElementById('result-reason').textContent = result.reason;
    } else {
        reasonItem.style.display = 'none';
    }
    
    // Scroll to results
    resultsCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function updateScore(id, value) {
    const percentage = (value * 100).toFixed(1);
    document.getElementById(id).textContent = percentage + '%';
    document.getElementById(id + '-fill').style.width = percentage + '%';
}

function updateStats() {
    totalScanned++;
    document.getElementById('total-scanned').textContent = totalScanned.toLocaleString();
}

// Auto-fill demo data
function fillDemoData() {
    document.getElementById('txn-id').value = 'TXN' + Math.floor(Math.random() * 10000);
    document.getElementById('sender').value = 'USER' + Math.floor(Math.random() * 1000);
    document.getElementById('receiver').value = 'USER' + Math.floor(Math.random() * 1000);
    document.getElementById('amount').value = Math.floor(Math.random() * 50000) + 1000;
    document.getElementById('device').value = 'DEVICE' + Math.floor(Math.random() * 100);
    document.getElementById('ip').value = `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
}

// Add demo button on page load
window.addEventListener('load', () => {
    const form = document.getElementById('transaction-form');
    const demoBtn = document.createElement('button');
    demoBtn.type = 'button';
    demoBtn.textContent = 'Fill Demo Data';
    demoBtn.className = 'btn-primary';
    demoBtn.style.marginTop = '10px';
    demoBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    demoBtn.onclick = fillDemoData;
    form.appendChild(demoBtn);
});
