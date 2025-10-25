function add(a, b) {
    return a + b;
}

const iterations = 1000000;
let total = 0;

console.log('Running addition test');

for (let i = 0; i < iterations; i++) {
    total = add(i, 1);
    if (i === 500000) {
        console.log('Triggering deoptimization with string concat');
        console.log('Result:', add('hello', ' world'));
    }
}

console.log('Test complete');