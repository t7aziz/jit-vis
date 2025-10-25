// Test demonstrating type-based optimization and shape-based optimization

function add(a, b) {
    return a + b;
}

function getX(obj) {
    return obj.x;
}

console.log('Running object test');

console.log('Warming up add() with numbers');
for (let i = 0; i < 100000; i++) {
    add(i, i + 1);
}
console.log('add() optimized for numbers');

console.log('Warming up getX() with simple objects');
for (let i = 0; i < 100000; i++) {
    getX({ x: i });
}
console.log('getX() optimized for {x} shape');

console.log('Training getX() with complex objects');
for (let i = 0; i < 100000; i++) {
    getX({ x: i, y: 100 });
}
console.log('getX() trained for polymorphic shapes');


// Wait for optimizations to complete before deoptimizing
setTimeout(() => {
    console.log('Triggering type-based deoptimization');
    try {
        console.log('Adding strings:', add('hello', ' world'));
    } catch (e) {
        console.log('Error:', e.message);
    }

    console.log('Triggering shape-based deoptimization');
    try {
        console.log('Accessing invalid shape:', getX({ z: 99 }));
    } catch (e) {
        console.log('Error:', e.message);
    }
}, 100);

console.log("Object test complete");