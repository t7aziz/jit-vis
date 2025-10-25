// Test demonstrating optimization of both simple and recursive functions

function add(a, b) {
    return a + b;
}

function fibonacci(n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log('Running fibonacci test');

console.log('Optimizing simple addition');
for (let i = 0; i < 100000; i++) {
    add(i, i + 1);
}

console.log('Optimizing recursive fibonacci');
for (let i = 0; i < 10; i++) {
    fibonacci(20);
}
console.log('Fibonacci test complete');