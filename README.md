# vis-jit
[![npm version](https://badge.fury.io/js/vis-jit.svg)](https://www.npmjs.com/package/vis-jit)

A small module and browser tool to visualize real-time V8 JIT/TurboFan optimization events from V8 log output

## Installation
```bash
npm install vis-jit
# Usage: vis-jit your_script.js
# Options: -p, --port <number> (default is 3000)
```

## Features
What it does
- Redirects curated V8 log output to log file and fetches to frontend
- Parses events in real-time and displays an optimization graph using vis-network as well as the raw data

Notes:
- The frontend is in `public/` (edit `public/app.js` and `public/index.html`)
- Server entrypoint: `server.js` (serves `public/` and exposes `/api/data`)
- The parser lives in `public/app.js` (function `parseV8Log`)
- The command line program is in `cli.js`

## Examples
To use examples, clone the vis-jit repository:
```bash
git clone https://github.com/t7aziz/vis-jit.git
```
Then install the dependencies:
```bash
npm install
```
Then run whichever test in tests directory:
```bash
vis-jit tests/test3.js
```

## Contributions
- PRs welcome. Keep changes small and include a brief test or manual verification steps.

## License
- MIT
