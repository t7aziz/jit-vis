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
        const logFile = 'realtime-turbo.log';
        const logFilePath = path.join(process.cwd(), logFile);

        // Create a writable stream to our log file in append mode
        const logStream = fs.createWriteStream(logFilePath, { flags: 'a' });

        console.log(`Spawning "${file}" and capturing logs to "${logFile}"...`);

        // Spawn the user's script with tracing
        const child = spawn('node', ['--trace-opt', '--trace-deopt', file]);

        // Pipe the child's standard output directly to our log file
        child.stdout.pipe(logStream);
        child.stderr.on('data', (data) => {
            console.error(`[${file} stderr]: ${data}`);
        });

        child.on('close', (code) => {
            console.log(`Target script exited with code ${code}`);
        });

        console.log('Starting local visualization server...');

        // Spawn the server, passing the log file path via an environment variable
        const serverPath = path.join(__dirname, 'server.js');
        spawn('node', [serverPath], {
            stdio: 'inherit',
            env: { ...process.env, LOG_FILE_PATH: logFilePath }
        });
    });

program.parse(process.argv);