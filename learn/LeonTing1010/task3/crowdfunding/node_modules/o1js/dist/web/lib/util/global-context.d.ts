export { Context };
declare namespace Context {
    type id = number;
    type t<Context> = (() => Context | undefined) & {
        data: {
            context: Context;
            id: id;
            trace?: string;
        }[];
        allowsNesting: boolean;
        get(): Context;
        has(): boolean;
        runWith<C extends Context, Result>(context: Context, func: (context: C) => Result): [C, Result];
        runWithAsync<Result>(context: Context, func: (context: Context) => Promise<Result>): Promise<[Context, Result]>;
        enter(context: Context): id;
        leave(id: id): Context;
        id: () => id;
    };
}
declare const Context: {
    create: typeof create;
};
declare function create<C>(options?: {
    allowsNesting?: boolean | undefined;
    default?: C | undefined;
}): Context.t<C>;
