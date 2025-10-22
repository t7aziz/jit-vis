// public/app.js

// A simplified parser for the V8 log file
function parseV8Log(logData) {
    const nodes = [];
    const edges = [];
    let idCounter = 1;
    const nodeMap = new Map(); // To track nodes by name and avoid duplicates

    // Find the 'source_code' and 'phases' for a function
    const functionOptimization = logData.find(entry => entry.name === 'optimizing' && entry.phases);

    if (!functionOptimization) {
        console.error("Could not find an optimized function with phases in the log.");
        return { nodes: [{ id: 1, label: 'No Data' }], edges: [] };
    }

    // Process each phase as a node
    functionOptimization.phases.forEach((phase, index) => {
        const node = {
            id: idCounter++,
            label: `${phase.name}\n(${phase.type})`,
            title: `Phase: ${phase.name}`
        };
        nodes.push(node);
        nodeMap.set(phase.name, node.id);

        // Create an edge from the previous phase to this one
        if (index > 0) {
            const prevPhase = functionOptimization.phases[index - 1];
            edges.push({
                from: nodeMap.get(prevPhase.name),
                to: node.id,
                arrows: 'to'
            });
        }
    });

    return { nodes, edges };
}

// Main function to fetch data and render the graph
async function main() {
    try {
        const response = await fetch('/api/data');
        const rawData = await response.text();

        // The V8 log is a stream of JSONs
        const logArray = JSON.parse(`[${rawData.trim().replace(/,\s*$/, "")}]`);

        const graphData = parseV8Log(logArray);

        const container = document.getElementById('graph-container');
        const options = {
            layout: {
                hierarchical: {
                    direction: 'UD', // Up-Down
                    sortMethod: 'directed'
                }
            },
            edges: {
                smooth: true
            },
            physics: false
        };

        new vis.Network(container, graphData, options);

    } catch (error) {
        console.error('Failed to load or render graph:', error);
        const container = document.getElementById('graph-container');
        container.innerText = 'Error loading visualization data. Check the console.';
    }
}

main();