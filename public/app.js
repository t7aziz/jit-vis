/**
 * Parses the plain text V8 log file with improved regex and graph logic.
 * @param {string} rawLogText - The raw text content from turbo.json.
 * @returns {{nodes: Array, edges: Array}} - Data formatted for vis-network.
 */
function parseV8Log(rawLogText) {
    const nodes = [];
    const edges = [];

    const nodeMap = new Map(); // { functionName: nodeId }
    const lastEventPerFunction = new Map(); // { functionName: lastEventNodeId }
    const functionLayoutInfo = new Map(); // { functionName: { y, nextX } }
    let lastGlobalNodeId = null;
    let idCounter = 1;
    let nextFunctionY = 0; // Vertical position for the next function's row

    const lines = rawLogText.trim().split('\n');
    const lineRegex = /^\[(.*?)]$/;

    lines.forEach(line => {
        const fullMatch = line.match(lineRegex);
        if (!fullMatch) return;

        const logEntryText = fullMatch[1].trim();
        const functionNameMatch = logEntryText.match(/<JSFunction\s(.*?)\s\(/);
        const functionName = functionNameMatch ? functionNameMatch[1].trim() : 'Global/Unknown';

        let functionNodeId;
        let layout;

        // Function block creation
        if (!nodeMap.has(functionName)) {
            functionNodeId = idCounter++;
            nodeMap.set(functionName, functionNodeId);

            // Define the layout for this new function's row
            layout = { y: nextFunctionY, nextX: 300 };
            functionLayoutInfo.set(functionName, layout);

            nodes.push({
                id: functionNodeId,
                label: `Function:\n<b>${functionName}</b>`,
                color: '#97C2FC',
                x: 0, // All function nodes start at x=0
                y: layout.y,
                fixed: true, // Lock the function node in place
            });

            nextFunctionY += 150; // Increment Y for the next function row
        } else {
            functionNodeId = nodeMap.get(functionName);
            layout = functionLayoutInfo.get(functionName);
        }

        // Event Node Creation
        const eventNodeId = idCounter++;
        let nodeColor = '#FFFF00';
        let action = logEntryText.substring(0, 40) + '...'; // Fallback display (truncated raw log)

        // Bailout/Deoptimization (Extract Reason)
        if (logEntryText.startsWith('bailout')) {
            const reasonMatch = logEntryText.match(/reason:\s(.*?)[\]\)]:/);
            const reason = reasonMatch ? reasonMatch[1].trim() : 'Unknown';
            action = `Deopt\nReason: ${reason}`;
            nodeColor = '#FF7B7B'; // Red
        }
        // Completed Compiling/Optimizing (Extract Time)
        else if (logEntryText.startsWith('completed compiling') || logEntryText.startsWith('completed optimizing')) {
            const timeMatch = logEntryText.match(/took\s([\d\.,\s]+)\sms/);
            const time = timeMatch ? `\nTime: ${timeMatch[1].trim()} ms` : '';

            if (logEntryText.startsWith('completed compiling')) {
                action = `Compiled${time}`;
            } else {
                action = `Optimized${time}`;
            }
            nodeColor = '#7BFF7B';
        }
        // Compiling Method
        else if (logEntryText.startsWith('compiling method')) {
            const osr = logEntryText.includes('OSR') ? ' (OSR)' : '';
            const target = logEntryText.includes('TURBOFAN') ? ' (TurboFan)' : '';
            action = `Compiling${target}${osr}`;
            nodeColor = '#2ed6c5ff';
        }
        // Marking (Extract Reason)
        else if (logEntryText.startsWith('marking')) {
            const reasonMatch = logEntryText.match(/reason:\s(.*?)(?:,|$)/);
            const reason = reasonMatch ? reasonMatch[1].trim() : 'Unknown';
            action = `Marked for Opt\nReason: ${reason}`;
            nodeColor = '#2ed6c5ff';
        }

        nodes.push({
            id: eventNodeId,
            label: action,
            color: nodeColor,
            x: layout.nextX, // Position node horizontally in its row
            y: layout.y, // Position node vertically in its row
            fixed: { y: true, x: false } // Lock to the row, allow slight horizontal adjustment
        });

        layout.nextX += 250; // Increment X for the next event in this row

        // Edge Creation
        const previousEventId = lastEventPerFunction.get(functionName);
        if (!previousEventId) {
            edges.push({ from: functionNodeId, to: eventNodeId, arrows: 'to', color: { color: '#66a3ff' } });
        } else {
            edges.push({ from: previousEventId, to: eventNodeId, arrows: 'to', color: { color: '#66a3ff' } });
        }
        lastEventPerFunction.set(functionName, eventNodeId);

        // Dashed line for global chronology
        if (lastGlobalNodeId) {
            edges.push({ from: lastGlobalNodeId, to: eventNodeId, arrows: 'to', dashes: true, color: { color: '#8d8d8dff' } });
        }
        lastGlobalNodeId = eventNodeId;
    });

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
            nodes: {
                shape: 'box',
                shapeProperties: { borderRadius: 4 },
                widthConstraint: { minimum: 150, maximum: 150 }, // Set fixed width
                font: { multi: 'html', size: 18, align: 'left' },
            },
            physics: false,
        };

        new vis.Network(container, graphData, options);

    } catch (error) {
        console.error('Failed to load or render graph:', error);
        const container = document.getElementById('graph-container');
        container.innerText = 'Error loading visualization data. Check the console.';
    }
}

main();