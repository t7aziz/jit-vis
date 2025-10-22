// server.js
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to serve the generated turbo.json log file
app.get('/api/data', (req, res) => {
    const logFilePath = path.join(process.cwd(), 'turbo.json');
    fs.readFile(logFilePath, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).send({ error: 'Could not read turbo.json file.' });
        }
        res.send(data);
    });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});