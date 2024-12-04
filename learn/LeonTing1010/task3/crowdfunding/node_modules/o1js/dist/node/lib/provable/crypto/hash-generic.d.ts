import { GenericSignableField } from '../../../bindings/lib/generic.js';
export { createHashHelpers, HashHelpers };
type Hash<Field> = {
    initialState(): Field[];
    update(state: Field[], input: Field[]): Field[];
};
type HashHelpers<Field> = ReturnType<typeof createHashHelpers<Field>>;
declare function createHashHelpers<Field>(Field: GenericSignableField<Field>, Hash: Hash<Field>): {
    salt: (prefix: string) => Field[];
    emptyHashWithPrefix: (prefix: string) => Field;
    hashWithPrefix: (prefix: string, input: Field[]) => Field;
};
