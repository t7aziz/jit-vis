// A function that V8 will try to optimize.
function dynamicAdd(a, b) {
    return a + b;
}

console.log('Initial warm-up with numbers:');

// Warm up the function so it gets compiled and optimized for numbers.
function warmUp() {
    for (let i = 0; i < 200000; i++) {
        dynamicAdd(i, 1);
    }
}

warmUp();

console.log('Warm-up finished. Starting real-time phase:');

let iteration = 0;
setInterval(() => {
    iteration++;
    console.log(`\n--- Iteration ${iteration} ---`);

    // Every few seconds, we will switch the data type.
    // This will cause V8 to deoptimize the function and then re-optimize it for the new type.
    if (iteration % 10 === 0) {
        console.log('Calling with STRINGS to test optimization...');
        dynamicAdd('hello', ' world');
        dynamicAdd('foo', ' bar');
        warmUp(); // trigger op again
    } else if (iteration % 15 === 0) {
        console.log('Calling with BOOLS to test optimization');
        dynamicAdd(true, false);
        dynamicAdd(false, false);
        warmUp();
    } else {
        dynamicAdd(iteration, iteration);
        dynamicAdd(iteration * 2, iteration * 3);
    }

}, 250); // Run this block every ,x); seconds.