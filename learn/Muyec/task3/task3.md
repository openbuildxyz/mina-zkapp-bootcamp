- [x] ## tx hash : B62qpij3Di9spk6dtGEiXbAWZZSPa8aTcvMR6hQUCS5oMGXUJfov4V1
- [x] ## report test :> contracts@0.1.0 test
> node --experimental-vm-modules node_modules/jest/bin/jest.js

(node:17992) ExperimentalWarning: VM Modules is an experimental feature and might change at any time
(Use `node --trace-warnings ...` to show where the warning was created)
  console.log
    now hardtop: 20000000000

      at Object.<anonymous> (src/Add.test.ts:55:17)

  console.log
    int curBalance: 0

      at Object.<anonymous> (src/Add.test.ts:58:11)

 PASS  src/Add.test.ts (19.177 s)
  Add
    √ 部署合约 (2315 ms)
    √ 正常投资操作 (6761 ms)
    √ 超过硬顶投资适应 (1951 ms)
    √ 未到期提款失败 (1703 ms)
    √ 正常提款操作 (1385 ms)
    √ 非法提款操作失败 (673 ms)

Test Suites: 1 passed, 1 total
Tests:       6 passed, 6 total
Snapshots:   0 total
Time:        19.35 s
Ran all test suites.