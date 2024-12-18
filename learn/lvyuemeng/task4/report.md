## tx hash

> 5Ju9pJD4HRe5S5SZe9MaXpUcvfWXkaGUbZm5QjhwpEYhQxgtUXSX

I don't know why the bug occur.
```
✔ Build project
✔ Generate build.json
✔ Choose smart contract
  The 'CrowdFunding' smart contract will be used
  for this deploy alias as specified in config.json.
✔ Generate verification key (takes 10-30 sec)
  Using the cached verification key
✖ Build transaction
  TypeError: Cannot read properties of undefined (reading 'x')
TypeError: Cannot read properties of undefined (reading 'x')
    at PublicKey.toFields (o1js/dist/node/lib/provable/types/circuit-value.js:39:48)
    at Object.set (o1js/dist/node/lib/mina/state.js:110:58)
    at CrowdFunding.deploy (file:///E:/Project/JsProj/Zk/ZkSharp/build/src/task4/crowdfunding.js:67:23)
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

## Test

```
src\test\fundingTiming.test.ts:
curBalance of ZkApp: 0
✓ Add > generates and deploys the `CrowdFunding` smart contract [235.00ms]
✓ Add > correctly contribute on the `CrowdFunding` smart contract [5015.00ms]
Contribution total 100 Mina.
current block height:  31
Before withdraw:  999
bad draw by others
bad draw by others
Instant withdraw:  1099
Send Check Amount:  10
200 blocks later:  1089
Send Check Amount:  10
400 blocks later:  1079
Send Check Amount:  10
600 blocks later:  1069
Send Check Amount:  10
800 blocks later:  1059
Send Check Amount:  10
1000 blocks later:  1049
Send Check Amount:  10
1200 blocks later:  1039
Send Check Amount:  10
1400 blocks later:  1029
Send Check Amount:  10
1600 blocks later:  1019
Send Check Amount:  10
1800 blocks later:  1009
Send Check Amount:  10
2000 blocks later:  999
✓ Add > send and withdraw on the `CrowdFunding` smart contract [2281.00ms]

 3 pass
 0 fail
 5 expect() calls
Ran 3 tests across 1 files. [8.31s]
```