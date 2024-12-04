export { FieldType, FieldVar, FieldConst, ConstantFieldVar, VarFieldVar };
type FieldConst = [0, bigint];
declare function constToBigint(x: FieldConst): bigint;
declare function constFromBigint(x: bigint): FieldConst;
declare const FieldConst: {
    fromBigint: typeof constFromBigint;
    toBigint: typeof constToBigint;
    equal(x: FieldConst, y: FieldConst): boolean;
    0: FieldConst;
    1: FieldConst;
    [-1]: FieldConst;
};
declare enum FieldType {
    Constant = 0,
    Var = 1,
    Add = 2,
    Scale = 3
}
/**
 * `FieldVar` is the core data type in snarky. It is eqivalent to `Cvar.t` in OCaml.
 * It represents a field element that is part of provable code - either a constant or a variable.
 *
 * **Variables** end up filling the witness columns of a constraint system.
 * Think of a variable as a value that has to be provided by the prover, and that has to satisfy all the
 * constraints it is involved in.
 *
 * **Constants** end up being hard-coded into the constraint system as gate coefficients.
 * Think of a constant as a value that is known publicly, at compile time, and that defines the constraint system.
 *
 * Both constants and variables can be combined into an AST using the Add and Scale combinators.
 */
type FieldVar = [FieldType.Constant, FieldConst] | [FieldType.Var, number] | [FieldType.Add, FieldVar, FieldVar] | [FieldType.Scale, FieldConst, FieldVar];
type ConstantFieldVar = [FieldType.Constant, FieldConst];
type VarFieldVar = [FieldType.Var, number];
declare const FieldVar: {
    Constant(x: FieldConst): ConstantFieldVar;
    Var(x: number): VarFieldVar;
    Add(x: FieldVar, y: FieldVar): [FieldType.Add, FieldVar, FieldVar];
    Scale(c: FieldConst, x: FieldVar): [FieldType.Scale, FieldConst, FieldVar];
    constant(x: bigint | FieldConst): ConstantFieldVar;
    add(x: FieldVar, y: FieldVar): FieldVar;
    scale(c: bigint | FieldConst, x: FieldVar): FieldVar;
    isConstant(x: FieldVar): x is ConstantFieldVar;
    isVar(x: FieldVar): x is VarFieldVar;
    isAdd(x: FieldVar): x is [FieldType.Add, FieldVar, FieldVar];
    isScale(x: FieldVar): x is [FieldType.Scale, FieldConst, FieldVar];
    0: [FieldType.Constant, FieldConst];
    1: [FieldType.Constant, FieldConst];
    [-1]: [FieldType.Constant, FieldConst];
};
