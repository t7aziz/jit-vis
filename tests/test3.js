// Function that will be repeatedly optimized and deoptimized
function add(a, b) {
    return a + b;
}

// Warm up function with numeric operations
function warmUp() {
    console.log('Warming up with numbers');
    for (let i = 0; i < 200000; i++) {
        add(i, 1);
    }
    console.log('Warm-up complete');
}

console.log('Starting types adding test');
warmUp();

let iteration = 0;
setInterval(() => {
    iteration++;
    console.log(`Iteration ${iteration}`);

    // Cycle through different types to trigger optimization/deoptimization
    if (iteration % 10 === 0) {
        console.log('Testing string optimization');
        add('hello', ' world');
        add('foo', ' bar');
        warmUp(); // Re-optimize for numbers
    } else if (iteration % 15 === 0) {
        console.log('Testing boolean optimization');
        add(true, false);
        add(false, false);
        warmUp(); // Re-optimize for numbers
    } else {
        add(iteration, iteration);
        add(iteration * 2, iteration * 3);
    }

}, 250); // Run this block every ,x); seconds.

console.log("Types adding test complete");