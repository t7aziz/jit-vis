#!/usr/bin/env node
const { Command } = require('commander');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const program = new Command();

program
    .version('1.0.0')
    .description('A tool to visualize V8 JIT optimizations for a given file in real-time.')
    .argument('<file>', 'The JavaScript file to profile.')
    .action((file) => {
        const logFilePath = path.join(process.cwd(), 'realtime-turbo.log');

        // Clear the log file
        if (fs.existsSync(logFilePath)) {
            fs.unlinkSync(logFilePath);
        }

        console.log(`Running "${file}" and capturing logs to "${logFilePath}"...`);

        // Use --redirect-code-traces-to to force V8 to write directly to file
        const child = spawn('node', [
            '--trace-opt',
            '--trace-deopt',
            '--redirect-code-traces',
            `--redirect-code-traces-to=${logFilePath}`,
            file
        ], {
            stdio: 'inherit'
        });

        // Monitor the file for changes in real-time
        let lastSize = 0;
        let lastPosition = 0;

        const tailInterval = setInterval(() => {
            if (!fs.existsSync(logFilePath)) return;

            const stats = fs.statSync(logFilePath);
            if (stats.size > lastSize) {
                // Read only the new data
                const stream = fs.createReadStream(logFilePath, {
                    start: lastPosition,
                    end: stats.size
                });

                let newData = '';
                stream.on('data', (chunk) => {
                    newData += chunk.toString();
                });

                stream.on('end', () => {
                    if (newData.trim()) {
                        console.log('[V8 Log] New optimization events:');
                        console.log(newData);
                    }
                    lastPosition = stats.size;
                    lastSize = stats.size;
                });
            }
        }, 100); // Check every 100ms

        child.on('exit', (code) => {
            clearInterval(tailInterval);
            console.log(`\nChild process exited with code ${code}`);
            if (fs.existsSync(logFilePath)) {
                const stats = fs.statSync(logFilePath);
                console.log(`Logs completed, written to ${logFilePath} (${stats.size} bytes)`);
            }
        });

        console.log('Starting local visualization server...');
        const serverPath = path.join(__dirname, 'server.js');
        spawn('node', [serverPath], {
            stdio: 'inherit',
            env: { ...process.env, LOG_FILE_PATH: logFilePath }
        });
    });

program.parse(process.argv);