/**
 * This file exists to avoid an import cycle between code that just needs access
 * to a smart contract base class, and the code that implements `SmartContract`.
 */
import type { SmartContract } from './zkapp.js';
export { isSmartContract, SmartContractBase };
declare class SmartContractBase {
}
declare function isSmartContract(object: unknown): object is SmartContract;
