function sum(a, b) {
    return a + b;
}

// V8's JIT compiler optimizes code that is frequently executed
function runTest() {
    const iterations = 1000000;
    let total = 0;

    console.log('--- Starting warm-up loop ---');
    for (let i = 0; i < iterations; i++) {
        total = sum(i, 1);
        if (i == 500000) {
            console.log(sum('hello', ' world')); // Should cause deop
        }
    }
    console.log('--- Warm-up finished ---');
    console.log(`Final total: ${total}`);
}

runTest();