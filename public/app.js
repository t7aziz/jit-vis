// public/app.js

/**
 * Parses the plain text V8 log file with improved regex and graph logic.
 * @param {string} rawLogText - The raw text content from turbo.json.
 * @returns {{nodes: Array, edges: Array}} - Data formatted for vis-network.
 */
function parseV8Log(rawLogText) {
    const nodes = [];
    const edges = [];

    // --- State for layout control ---
    const nodeMap = new Map(); // { functionName: nodeId }
    const lastEventPerFunction = new Map(); // { functionName: lastEventNodeId }
    const functionLayoutInfo = new Map(); // { functionName: { y, nextX } }
    let lastGlobalNodeId = null;
    let idCounter = 1;
    let nextFunctionY = 0; // Vertical position for the next function's row

    const lines = rawLogText.trim().split('\n');

    // CRITICAL FIX: Capture the entire content inside the outer brackets (1).
    const lineRegex = /^\[(.*?)]$/;

    lines.forEach(line => {
        const fullMatch = line.match(lineRegex);
        if (!fullMatch) return;

        const fullLogContent = fullMatch[1].trim();

        // 1. ROBUST FUNCTION NAME EXTRACTION
        // Captures the function name or description (including anonymous or spaces) 
        // that appears between <JSFunction and the following ' (' block.
        const functionNameMatch = fullLogContent.match(/<JSFunction\s(.*?)\s\(/);

        // **FIX:** If no function name is found, use a fallback name instead of skipping the line.
        const functionName = functionNameMatch ? functionNameMatch[1].trim() : 'Global/Unknown';

        // 2. ISOLATE ACTION DETAILS
        // Get everything BEFORE the function pointer for clean action parsing.
        const functionPointerIndex = fullLogContent.indexOf('<JSFunction');
        const rawActionDetail = (functionPointerIndex !== -1)
            ? fullLogContent.substring(0, functionPointerIndex).trim()
            : fullLogContent; // Fallback

        let functionNodeId;
        let layout;

        // --- Function Node and Layout Initialization ---
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

        // --- Event Node Creation and Detail Extraction ---
        const eventNodeId = idCounter++;
        let nodeColor = '#FFFF00'; // Default yellow
        let action = rawActionDetail; // Fallback

        // 1. Bailout/Deoptimization (Extract Reason)
        if (rawActionDetail.startsWith('bailout')) {
            // Extracts reason from patterns like 'reason: X):' or 'reason: X]'
            const reasonMatch = rawActionDetail.match(/reason:\s(.*?)[\]\)]:/);
            const reason = reasonMatch ? reasonMatch[1].trim() : 'Unknown';
            action = `Deopt\nReason: ${reason}`;
            nodeColor = '#FF7B7B'; // Red
        }
        // 2. Completed Compiling/Optimizing (Extract Time)
        else if (rawActionDetail.startsWith('completed compiling') || rawActionDetail.startsWith('completed optimizing')) {
            // Captures the full time string, e.g., "0.024, 0.398, 0.014"
            const timeMatch = rawActionDetail.match(/took\s([\d\.,\s]+)\sms/);
            const time = timeMatch ? `\nTime: ${timeMatch[1].trim()} ms` : '';

            if (rawActionDetail.startsWith('completed compiling')) {
                action = `Compiled${time}`;
            } else {
                action = `Optimized${time}`;
            }
            nodeColor = '#7BFF7B'; // Green
        }
        // 3. Compiling Method (Extract OSR/Target)
        else if (rawActionDetail.startsWith('compiling method')) {
            const osr = rawActionDetail.includes('OSR') ? ' (OSR)' : '';
            const target = rawActionDetail.includes('TURBOFAN') ? ' (TurboFan)' : '';
            action = `Compiling${target}${osr}`;
            nodeColor = '#8D8DFF'; // Blueish
        }
        // 4. Marking (Extract Reason)
        else if (rawActionDetail.startsWith('marking')) {
            // Extracts reason from the cleaned action detail.
            const reasonMatch = rawActionDetail.match(/reason:\s(.*?)$/);
            const reason = reasonMatch ? reasonMatch[1].trim() : 'Unknown';
            action = `Marked for Opt\nReason: ${reason}`;
            nodeColor = '#99D0FF'; // Lighter blue
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

        // --- Edge Creation ---
        const previousEventId = lastEventPerFunction.get(functionName);
        if (!previousEventId) {
            // First event: connect from function node
            edges.push({ from: functionNodeId, to: eventNodeId, arrows: 'to', color: { color: '#66a3ff' } });
        } else {
            // Subsequent event: connect from previous event
            edges.push({ from: previousEventId, to: eventNodeId, arrows: 'to', color: { color: '#66a3ff' } });
        }
        lastEventPerFunction.set(functionName, eventNodeId);

        // Dashed line for global chronology
        if (lastGlobalNodeId) {
            edges.push({ from: lastGlobalNodeId, to: eventNodeId, arrows: 'to', dashes: true, color: { color: '#cccccc' } });
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
                widthConstraint: { minimum: 200, maximum: 200 }, // Set fixed width
                font: { multi: 'html', size: 13, align: 'left' },
            },
            edges: {
                smooth: {
                    type: 'cubicBezier',
                    forceDirection: 'horizontal',
                    roundness: 0.9
                }
            },
            // IMPORTANT: No layout section, and physics is disabled.
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