// long-running-test.js

// A function that V8 will try to optimize.
function dynamicAdd(a, b) {
    return a + b;
}

console.log('--- Initial warm-up with numbers ---');

// Warm up the function so it gets compiled and optimized for numbers.
for (let i = 0; i < 200000; i++) {
    dynamicAdd(i, 1);
}

console.log('--- Warm-up finished. Starting real-time phase... ---');

let iteration = 0;
setInterval(() => {
    iteration++;
    console.log(`\n--- Iteration ${iteration} ---`);

    // Every few seconds, we will switch the data type.
    // This will cause V8 to deoptimize the function and then re-optimize it for the new type.
    if (iteration % 2 === 0) {
        console.log('Calling with STRINGS to trigger deoptimization...');
        dynamicAdd('hello', ' world');
        dynamicAdd('foo', ' bar');
    } else {
        console.log('Calling with NUMBERS to trigger re-optimization...');
        dynamicAdd(iteration, iteration);
        dynamicAdd(iteration * 2, iteration * 3);
    }

}, 1000); // Run this block every 3 seconds.