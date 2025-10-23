#!/usr/bin/env node

const { Command } = require('commander');
const { exec, spawn } = require('child_process');
const path = require('path');

const program = new Command();

program
    .version('1.0.0')
    .description('A tool to visualize V8 JIT optimizations for a given file')
    .argument('<file>', 'The JavaScript file to profile.')
    .action((file) => {
        const logFile = 'turbo.json';
        const nodeCommand = `node --trace-opt --trace-deopt --redirect-code-traces --redirect-code-traces-to=${logFile} ${file}`;

        console.log(`Generating V8 logs for "${file}"...`);

        // Execute the node command to generate the log file
        exec(nodeCommand, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error generating logs: ${error.message}`);
                return;
            }
            console.log('Logs generated successfully!');

            console.log('Starting visualization server...');

            // Spawn the server process
            const serverPath = path.join(__dirname, 'server.js');
            const serverProcess = spawn('node', [serverPath], { stdio: 'inherit' });

            serverProcess.on('close', (code) => {
                console.log(`Server process exited with code ${code}`);
            });
        });
    });

program.parse(process.argv);