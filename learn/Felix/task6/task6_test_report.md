```bash
root@felixTP:~/my-chain# pnpm run test --filter=chain

> starter-kit@ test /root/my-chain
> turbo run test "--filter=chain"

Attention:
Turborepo now collects completely anonymous telemetry regarding usage.
This information is used to shape the Turborepo roadmap and prioritize features.
You can learn more, including how to opt-out if you'd not like to participate in this anonymous program, by visiting the following URL:
https://turbo.build/repo/docs/telemetry

turbo 2.1.2

• Packages in scope: chain
• Running test in 1 packages
• Remote caching disabled
┌ chain#test > cache miss, executing 4f8cb50e813b84bc
│
│
│ > chain@1.0.0 test /root/my-chain/packages/chain
│ > node --experimental-vm-modules --experimental-was
│ m-modules --experimental-wasm-threads ./node_module
│ s/jest/bin/jest.js
│
│ (node:6579) ExperimentalWarning: VM Modules is an e
│ xperimental feature and might change at any time
│ (Use `node --trace-warnings ...` to show where the
│ warning was created)
│ PASS test/runtime/modules/balances.test.ts (10.60
│ 7 s)
│ balances
│ ✓ should demonstrate how balances work (4081 ms
│ )
│
│ Test Suites: 1 passed, 1 total
│ Tests: 1 passed, 1 total
│ Snapshots: 0 total
│ Time: 10.752 s
│ Ran all test suites.
└────>

Tasks: 1 successful, 1 total
Cached: 0 cached, 1 total
Time: 13.904s
```
