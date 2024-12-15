## tx hash



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