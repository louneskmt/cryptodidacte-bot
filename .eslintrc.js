module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "node": true
    },
    "extends": [
        "airbnb-base"
    ],
    "globals": {
        "Atomics": "readonly",
        "SharedArrayBuffer": "readonly"
    },
    "parserOptions": {
        "ecmaVersion": 2018
    },
    "rules": {
        "no-restricted-syntax": "off",
        "consistent-return": "off",
        "no-console": "off",
        "no-unused-vars": ['error', { "argsIgnorePattern": "reject" }]
    }
};