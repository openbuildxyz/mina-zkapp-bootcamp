export { AnyFunction, Tuple, TupleN, AnyTuple, TupleMap, Subclass };
type AnyFunction = (...args: any) => any;
type Tuple<T> = [T, ...T[]] | [];
type AnyTuple = Tuple<any>;
type TupleMap<T extends Tuple<any>, B> = [
    ...{
        [i in keyof T]: B;
    }
];
declare const Tuple: {
    map<T extends Tuple<any>, B>(tuple: T, f: (a: T[number]) => B): TupleMap<T, B>;
};
/**
 * tuple type that has the length as generic parameter
 */
type TupleN<T, N extends number> = N extends N ? number extends N ? [...T[]] : [...TupleRec<T, N, []>] : never;
declare const TupleN: {
    map<T extends Tuple<any>, B>(tuple: T, f: (a: T[number]) => B): TupleMap<T, B>;
    fromArray<T_1, N extends number>(n: N, arr: T_1[]): TupleN<T_1, N>;
    hasLength<T_2, N_1 extends number>(n: N_1, tuple: T_2[]): tuple is TupleN<T_2, N_1>;
};
type TupleRec<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : TupleRec<T, N, [T, ...R]>;
type Subclass<Class extends new (...args: any) => any> = (new (...args: any) => InstanceType<Class>) & {
    [K in keyof Class]: Class[K];
} & {
    prototype: InstanceType<Class>;
};
