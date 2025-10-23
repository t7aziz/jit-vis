// public/app.js

/**
 * Parses the plain text V8 log file using regular expressions.
 * It looks for actions (marking, compiling) and function names.
 * @param {string} rawLogText - The raw text content from turbo.json.
 * @returns {{nodes: Array, edges: Array}} - Data formatted for vis-network.
 */
function parseV8Log(rawLogText) {
    const nodes = [];
    const edges = [];
    const nodeMap = new Map(); // Tracks nodes to avoid duplicates { functionName: nodeId }
    let lastNodeId = null;
    let idCounter = 1;

    const lines = rawLogText.trim().split('\n');

    // Regex to capture the action (e.g., "marking") and function name (e.g., "runTest")
    const lineRegex = /\[(\w+)\s.*?<JSFunction\s(\w+)/;

    lines.forEach(line => {
        const match = line.match(lineRegex);
        if (!match) return; // Skip lines that don't match our pattern

        const action = match[1]; // e.g., "marking"
        const functionName = match[2]; // e.g., "runTest"

        // Create a unique node for each function if it doesn't exist
        if (!nodeMap.has(functionName)) {
            nodeMap.set(functionName, idCounter);
            nodes.push({
                id: idCounter,
                label: `Function:\n${functionName}`,
                color: '#97C2FC', // Blue for functions
                shape: 'box'
            });
            idCounter++;
        }

        // Create a node for the specific event/action
        const eventNodeId = idCounter++;
        const reasonMatch = line.match(/reason:\s(.*?)]/);
        const reason = reasonMatch ? `\nReason: ${reasonMatch[1]}` : '';

        nodes.push({
            id: eventNodeId,
            label: `${action}${reason}`,
            color: '#FFFF00' // Yellow for events
        });

        // Create an edge from the function to its event
        edges.push({
            from: nodeMap.get(functionName),
            to: eventNodeId,
            arrows: 'to'
        });

        // Create an edge from the previous event to this one to show sequence
        if (lastNodeId) {
            edges.push({
                from: lastNodeId,
                to: eventNodeId,
                arrows: 'to',
                dashes: true, // Dashed line for chronological flow
                color: { color: '#cccccc' }
            });
        }
        lastNodeId = eventNodeId;
    });

    if (nodes.length === 0) {
        return { nodes: [{ id: 1, label: 'No optimizable functions found in log.' }], edges: [] };
    }

    return { nodes, edges };
}

// Main function to fetch data and render the graph
async function main() {
    try {
        const response = await fetch('/api/data');
        const rawData = await response.text();

        // Display the raw data in the document
        const rawDataDisplay = document.createElement('pre');
        rawDataDisplay.textContent = rawData;
        document.body.insertBefore(rawDataDisplay, document.getElementById('graph-container'));

        const graphData = parseV8Log(rawData);

        const container = document.getElementById('graph-container');
        const options = {
            layout: {
                hierarchical: false // Hierarchical can be messy; let physics handle it
            },
            edges: {
                smooth: true
            },
            physics: {
                enabled: true,
                solver: 'repulsion' // A good physics model for this kind of graph
            }
        };

        new vis.Network(container, graphData, options);

    } catch (error) {
        console.error('Failed to load or render graph:', error);
        const container = document.getElementById('graph-container');
        container.innerText = 'Error loading visualization data. Check the console.';
    }
}

main();