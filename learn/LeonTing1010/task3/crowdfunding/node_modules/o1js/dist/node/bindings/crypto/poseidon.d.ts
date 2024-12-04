export { Poseidon, PoseidonLegacy };
declare const Poseidon: {
    hashToGroup: (input: bigint[]) => {
        x: bigint;
        y: bigint;
    } | undefined;
    initialState: () => bigint[];
    update: ([...state]: bigint[], input: bigint[]) => bigint[];
    hash: (input: bigint[]) => bigint;
};
declare const PoseidonLegacy: {
    initialState: () => bigint[];
    update: ([...state]: bigint[], input: bigint[]) => bigint[];
    hash: (input: bigint[]) => bigint;
};
