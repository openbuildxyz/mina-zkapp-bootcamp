import { DelegationJson, PaymentJson } from '../sign-legacy.js';
export { signatures, payments, delegations, strings, keypair };
declare let keypair: {
    privateKey: string;
    publicKey: string;
};
declare let payments: PaymentJson[];
declare let delegations: DelegationJson[];
declare let strings: string[];
/**
 * for each network (testnet, mainnet), these are the signatures for
 * - the 3 payments,
 * - the 3 stake delegations,
 * - the 3 strings.
 */
declare let signatures: {
    [k: string]: {
        field: string;
        scalar: string;
    }[];
};
