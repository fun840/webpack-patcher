// ==UserScript==
// @name        Webpack Patcher
// @author      fun840 (https://github.com/fun840)
// @namespace   https://github.com/fun840/webpack-patcher
// @version     1.0
// @match       https://example.com/
// @grant       none
// @description A small userscript for patching webpack
// @icon        https://raw.githubusercontent.com/webpack/webpack.js.org/main/src/favicon.ico
// @run-at      document-start
// ==/UserScript==

const webpackArray = "webpackJsonp"; // the webpack chunk array
const log = true; // disable if you don't want messages for patching every module

const patches = [
    /* example patch
    {
        // this can be regex or a string
        from: "function foo() {",
        to: "function foo(){console.log('Successfully patched!')",
    },
    */
];

// check if eval() is allowed, if it's not the script won't work
try {
    eval("");
} catch {
    throw new Error("[Webpack Patcher] Eval is unavailable, script won't work!");
}

Object.defineProperty(window, webpackArray, {
    set(val) {
        val.push = new Proxy(val.push, {
            apply(target, thisArg, args) {
                const arr = args[0];
                const modules = arr[1];

                for (const id of Object.keys(modules)) {
                    let func = modules[id].toString();

                    const oldFunc = func;
                    for (const patch of patches) {
                        func = func.replace(patch.from, patch.to);
                    }

                    // don't re-eval if not needed
                    if (func != oldFunc) {
                        modules[id] = eval("0," + func);
                    }
                }

                log && console.log("[Webpack Patcher] Patched", modules);

                return target.apply(thisArg, args);
            },
        });

        this.value = val;
    },
    get() {
        return this.value;
    },
});
