// jit-complex-test.js

function separator(title) {
    console.log(`\n--- ${title} ---\n`);
}

// Case 1: Deoptimization from Type Change
// This function will be optimized for adding numbers.
function add(a, b) {
    return a + b;
}

// Case 2: Polymorphism and Deoptimization from Shape Change
// This function will learn to handle objects with a property 'x'.
function getX(obj) {
    return obj.x;
}


function runTests() {
    separator('Warming up `add` function with monomorphic types (numbers)');
    for (let i = 0; i < 100000; i++) {
        add(i, i + 1);
    }
    console.log('`add` function should be optimized for numbers now.');


    separator('Warming up `getX` function with monomorphic shape ({x})');
    for (let i = 0; i < 100000; i++) {
        getX({ x: i });
    }
    console.log('`getX` should be optimized for shape {x: number}');


    separator('Introducing polymorphism to `getX` with shape ({x, y})');
    // V8 is smart and can re-optimize to handle multiple shapes (polymorphism).
    for (let i = 0; i < 100000; i++) {
        getX({ x: i, y: 100 });
    }
    console.log('`getX` should now be polymorphically optimized.');


    // Use setTimeout to ensure the optimizations have likely completed before we deopt.
    setTimeout(() => {
        separator('TRIGGERING DEOPTIMIZATION in `add`');
        try {
            // Calling with strings violates the "number" assumption.
            // V8 will throw away the optimized code. Look for a "deoptimizing" log.
            console.log('Calling add("hello", " world")... Result:', add('hello', ' world'));
        } catch (e) { console.error(e) }


        separator('TRIGGERING DEOPTIMIZATION in `getX`');
        try {
            // This object shape is completely unexpected. It doesn't have 'x'.
            // This will also trigger a deoptimization.
            console.log("Calling getX({ z: 99 })... Result:", getX({ z: 99 }));
        } catch (e) { console.error(e) }

    }, 100);
}

runTests();