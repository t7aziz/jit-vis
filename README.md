# jit-vis

A small module and browser tool to visualize V8 JIT/TurboFan optimization events from V8 log output

Quick start
1. Install dependencies:
	- npm install
2. Running (use the tests in tests/ for examples)
	- vis-jit replaceWithYourFile.js

What it does
- Redirects V8 log output to log file and fetches to frontend
- Parses events in real-time and displays an optimization graph using vis-network as well as the raw data

Notes:
- The frontend is in `public/` (edit `public/app.js` and `public/index.html`)
- Server entrypoint: `server.js` (serves `public/` and exposes `/api/data`)
- The parser lives in `public/app.js` (function `parseV8Log`)
- The command line program is in `cli.js`
- Should be platform-independent

Contributions
- PRs welcome. Keep changes small and include a brief test or manual verification steps.

License
- MIT

