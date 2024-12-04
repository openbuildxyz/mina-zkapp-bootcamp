# eslint-plugin-o1js

o1js rules for ESLint to detect bugs and invalid patterns in your Smart Contract code.

# Rules

- The maximum allowed state variables in a Smart Contract is 8
- Throw statements should not be used in a Circuit method
- If statements should not be used in a Circuit method
- Ternary statements should not be used in a Circuit method
- JavaScript JSON functions should not be used in a Circuit method
- JavaScript random functions should not be used in a Circuit method
- Overriding the constructor in a SmartContract is disallowed

# Installation

```
# npm
npm install eslint-plugin-o1js --save-dev

# yarn
yarn add eslint-plugin-o1js --dev
```

Add `eslint-plugin-o1js` to the `plugins` option in your eslint config:

```
{
  "plugins": ["o1js"]
}
```

- Then extend the recommended eslint config:

```
{
  extends: ['plugin:o1js/recommended'],
}
```

- You can enable specific rules manually:

```
{
  "rules": {
    "o1js/no-greater-storage-limit-in-circuit": "error",
    "o1js/no-throw-in-circuit": "error"
    ...
  }
}
```

- An example ESLint configuration looks like:

```
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['o1js'],
  extends: ['plugin:o1js/recommended'],
};

```

# Valid and Invalid Examples

Please refer to the project tests to learn more about the usage of the rules.
