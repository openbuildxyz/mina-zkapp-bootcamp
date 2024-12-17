## tx hash

> 5JvRqibQzwmFjzG4VCafhHwYMBvPneGZPwRRCCdeM8x3oVRGLTyi

Another bewilder bug.
```
✔ Build project
✔ Generate build.json
✔ Choose smart contract
  The 'TokenFunding' smart contract will be used
  for this deploy alias as specified in config.json.
✔ Generate verification key (takes 10-30 sec)
  Using the cached verification key
✖ Build transaction
  TypeError: Cannot read properties of undefined (reading 'x')
TypeError: Cannot read properties of undefined (reading 'x')
    at PublicKey.toFields (o1js/dist/node/lib/provable/types/circuit-value.js:39:48)
    at Object.set (o1js/dist/node/lib/mina/state.js:110:58)
    at TokenFunding.deploy (file:///E:/Project/JsProj/Zk/ZkSharp/build/src/task5/tokenfunding.js:67:23)
    at process.processTicksAndRejections (node:internal/process/task_queues:105:5)
    at async file:///C:/Users/nostalgia/node_modules/zkapp-cli/src/lib/deploy.js:353:9
    at async file:///E:/Project/JsProj/Zk/ZkSharp/node_modules/o1js/dist/node/lib/mina/transaction.js:71:17
    at async generateWitness (o1js/dist/node/lib/provable/core/provable-context.js:47:9)
    at async Object.runUnchecked (o1js/dist/node/lib/provable/provable.js:162:9)
    at async createTransaction (o1js/dist/node/lib/mina/transaction.js:70:13)
    at async file:///E:/Project/JsProj/Zk/ZkSharp/node_modules/o1js/dist/node/lib/mina/mina.js:208:26
    at async file:///C:/Users/nostalgia/node_modules/zkapp-cli/src/lib/deploy.js:347:14
    at async step (file:///C:/Users/nostalgia/node_modules/zkapp-cli/src/lib/helpers.js:60:20)
    at async deploy (file:///C:/Users/nostalgia/node_modules/zkapp-cli/src/lib/deploy.js:346:21)
    at async Object.handler (file:///C:/Users/nostalgia/node_modules/zkapp-cli/src/bin/index.js:135:30)
```

## report test

A bewilder bug.
```
src\test\tokenfunding2.test.ts:
seller:  100000000000n
curBalance of ZkApp: 0
✓ Add > deploy contracts and basic mint [5078.00ms]
seller:  100000000000n
After Transaction: 
buyer:  10000000000n
seller:  90000000000n
✓ Add > correctly contribute on the `CrowdFunding` smart contract [1469.00ms]
seller:  100000000000n
After Transaction: 
buyer:  10000000000n
seller:  90000000000n
✓ Add > After Block [1515.00ms]
```