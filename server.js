const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();

// Inherit values from cli.js
const PORT = process.env.PORT || 3000;
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

const server = app.listen(PORT, () => {
    console.log(`Application running at http://localhost:${PORT}`);
});

server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.error(`\nError: Port ${PORT} is already in use. Try freeing the port or changing ports by running: vis-jit -p NEW_PORT <file>\n`);
        process.exit(1);
    }
    throw err;
});