export { withPrefix, mapTuple };
declare function withPrefix<prefix extends string, T extends Record<string, any>>(prefix: prefix, obj: T): { [k in keyof T & string as `${prefix}_${k}`]: T[k]; };
type Tuple<T> = [T, ...T[]] | [];
declare function mapTuple<T extends Tuple<any>, B>(tuple: T, f: (a: T[number]) => B): {
    [i in keyof T]: B;
};
