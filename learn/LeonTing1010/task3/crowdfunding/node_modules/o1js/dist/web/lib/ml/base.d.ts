/**
 * This module contains basic methods for interacting with OCaml
 */
export { MlArray, MlPair, MlList, MlOption, MlBool, MlBytes, MlResult, MlUnit, MlString, MlTuple, MlArrayOptionalElements, };
type MlPair<X, Y> = [0, X, Y];
type MlArray<T> = [0, ...T[]];
type MlList<T> = [0, T, 0 | MlList<T>];
type MlOption<T> = 0 | [0, T];
type MlBool = 0 | 1;
type MlResult<T, E> = [0, T] | [1, E];
type MlUnit = 0;
type MlArrayOptionalElements<MlArray extends any[]> = {
    [K in keyof MlArray]: MlArray[K] extends 0 ? 0 : MlOption<MlArray[K]>;
};
/**
 * js_of_ocaml representation of a byte array,
 * see https://github.com/ocsigen/js_of_ocaml/blob/master/runtime/mlBytes.js
 */
type MlBytes = {
    t: number;
    c: string;
    l: number;
};
type MlString = MlBytes;
declare const MlArray: {
    to<T>(arr: T[]): MlArray<T>;
    from<T_1>([, ...arr]: MlArray<T_1>): T_1[];
    map<T_2, S>([, ...arr]: MlArray<T_2>, map: (t: T_2) => S): MlArray<S>;
    mapTo<T_3, S_1>(arr: T_3[], map: (t: T_3) => S_1): MlArray<S_1>;
    mapFrom<T_4, S_2>([, ...arr]: MlArray<T_4>, map: (t: T_4) => S_2): S_2[];
};
declare const MlPair: (<X, Y>(x: X, y: Y) => MlPair<X, Y>) & {
    from<X_1, Y_1>([, x, y]: MlPair<X_1, Y_1>): [X_1, Y_1];
    first<X_2>(t: MlPair<X_2, unknown>): X_2;
    second<Y_2>(t: MlPair<unknown, Y_2>): Y_2;
};
declare const MlBool: ((b: boolean) => MlBool) & {
    from(b: MlBool): boolean;
};
declare const MlOption: (<T>(x?: T) => MlOption<T>) & {
    from<T_1>(option: MlOption<T_1>): T_1 | undefined;
    map<T_2, S>(option: MlOption<T_2>, map: (t: T_2) => S): MlOption<S>;
    mapFrom<T_3, S_1>(option: MlOption<T_3>, map: (t: T_3) => S_1): S_1 | undefined;
    mapTo<T_4, S_2>(option: T_4 | undefined, map: (t: T_4) => S_2): MlOption<S_2>;
    isNone(option: MlOption<unknown>): option is 0;
    isSome<T_5>(option: MlOption<T_5>): option is [0, T_5];
};
declare const MlResult: {
    ok<T, E>(t: T): MlResult<T, E>;
    unitError<T_1>(): MlResult<T_1, 0>;
};
/**
 * tuple type that has the length as generic parameter
 */
type MlTuple<T, N extends number> = N extends N ? number extends N ? [0, ...T[]] : [0, ...TupleRec<T, N, []>] : never;
type TupleRec<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : TupleRec<T, N, [T, ...R]>;
type Tuple<T> = [T, ...T[]] | [];
declare const MlTuple: {
    map<T extends Tuple<any>, B>([, ...mlTuple]: [0, ...T], f: (a: T[number]) => B): [0, ...{ [i in keyof T]: B; }];
    mapFrom<T_1, N extends number, B_1>([, ...mlTuple]: MlTuple<T_1, N>, f: (a: T_1) => B_1): B_1[];
    mapTo<T_2 extends any[] | Tuple<any>, B_2>(tuple: T_2, f: (a: T_2[number]) => B_2): [0, ...{ [i_1 in keyof T_2]: B_2; }];
};
