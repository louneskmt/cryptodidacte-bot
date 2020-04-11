module.exports = {
    "env": {
        "browser": true,
        "commonjs": true,
        "es6": true,
        "jquery": true
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
        "no-unused-vars": "off",
        "max-len": ["error", { "code": 200 }],
        "guard-for-in": "off",
        "no-underscore-dangle": "off",
        "no-undef": "off",
        "no-use-before-define": "off",
        "func-names": "off",
        "no-restricted-globals": "off",
        "no-async-promise-executor": "off",
    }
};