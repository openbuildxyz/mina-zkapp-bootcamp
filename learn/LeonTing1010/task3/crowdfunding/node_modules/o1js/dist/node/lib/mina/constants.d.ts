/**
 * This file contains constants used in the Mina protocol.
 * Originally defined in the mina_compile_config file in the mina repo:
 * https://github.com/MinaProtocol/mina/blob/develop/src/lib/mina_compile_config/mina_compile_config.ml
 */
export declare namespace TransactionCost {
    const PROOF_COST: 10.26;
    const SIGNED_PAIR_COST: 10.08;
    const SIGNED_SINGLE_COST: 9.14;
    const COST_LIMIT: 69.45;
}
export declare namespace TransactionLimits {
    const MAX_ACTION_ELEMENTS: 100;
    const MAX_EVENT_ELEMENTS: 100;
}
