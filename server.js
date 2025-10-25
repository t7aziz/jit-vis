const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Read the log file path from the environment variable set by cli.js.
const LOG_FILE_PATH = process.env.LOG_FILE_PATH || path.join(process.cwd(), 'realtime-turbo.log');

console.log(`[Server] Monitoring log file: ${LOG_FILE_PATH}`);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to serve the log file
app.get('/api/data', (req, res) => {
    fs.readFile(LOG_FILE_PATH, 'utf8', (err, data) => {
        if (err) {
            // If the file doesn't exist yet, send empty data instead of an error.
            if (err.code === 'ENOENT') {
                return res.send('');
            }
            return res.status(500).send({ error: `Could not read log file: ${err.message}` });
        }
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`Application running at http://localhost:${PORT}`);
});