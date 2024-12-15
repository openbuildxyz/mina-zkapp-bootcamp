## tx hash

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
# Unhandled error between tests
-------------------------------
269 |     privateInputs = privateInputs.map((input) => input === SelfProof ? selfProof : input);
270 |     // check if all arguments are provable
271 |     let args = privateInputs.map((input, i) => {
272 |         if (isProvable(input))
273 |             return input;
274 |         throw Error(`Argument ${i + 1} of method ${methodName} is not a provable type: ${input}`);
                    ^
error: Argument 1 of method approveBase is not a provable type: function Object() {
    [native code]
}
      at E:\Project\JsProj\Zk\ZkSharp\node_modules\o1js\dist\node\lib\proof-system\zkprogram.js:274:15
      at map (1:11)
      at sortMethodArguments (E:\Project\JsProj\Zk\ZkSharp\node_modules\o1js\dist\node\lib\proof-system\zkprogram.js:271:30)
      at method (E:\Project\JsProj\Zk\ZkSharp\node_modules\o1js\dist\node\lib\mina\zkapp.js:62:31)
      at DecorateProperty (E:\Project\JsProj\Zk\ZkSharp\node_modules\reflect-metadata\Reflect.js:553:33)
      at E:\Project\JsProj\Zk\ZkSharp\src\task5\token.ts:5:16
-------------------------------


 0 pass
 1 fail
```