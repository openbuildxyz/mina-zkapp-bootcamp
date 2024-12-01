# Task 1

## Abstraction of Mina Proof System

### ZKP(Zero Knowledge Proof)

Based on the proposition by S.Goldwasser, S.Micali, C.Rackoff.

A theory of a prover to convince a verifier that an assertion is correct without providing any useful information to the 
verifier. Every verifier can verify every prover statement in a constant time based on a given proof constrain.(Note: It's a proof in probability rather than logic deduction.)

Which means:
- Private 
- Trustless 
- Efficient 
- Decentralized

## Recursive Zero-Knowledge Proof in Application of Mina Consensus

First, We want a proof system that can be used between prover and verifier, therefore, we want to build a circuit(pseudo) with input of prover and give out the output for verification.

Second, building such circult like building by block. Which means based on previous circuits to build next circuits.

```
   circuit0() -> p0
   circuit1(p0) -> p1    // verify(p1)

   circuit2() -> p2
   circuit3(p1, p2) -> p3  // verify(p3) 
```

Finally, in real application of Mina, following such steps:
1. block producer construct a new block
2.  
	1. validate a set of Tx
	2. construct new block based on preivous block's hash and validated Tx set.
3. boardcast new block
4. others repeat above.

The bundle size of Mina is so tiny(~22KB), we can verify everywhere without worrying about problems like storage, bandwidth.

## Faucet Transaction Hash
- 5Ju7Vhn5P4AJc4mypcBd6Mb3gWDJHMNByJGUWUu9jTtMgVm4AZru