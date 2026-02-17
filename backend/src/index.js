const express = require('express');
const bodyParser = require('body-parser');
const apiRouter = require('./routes/api');

const app = express();
app.use(bodyParser.json());

app.use('/api/v1', apiRouter);

app.get('/health', (req, res) => res.json({ status: 'healthy', service: 'fraud-detection' }));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Node backend listening on port ${PORT}`));
