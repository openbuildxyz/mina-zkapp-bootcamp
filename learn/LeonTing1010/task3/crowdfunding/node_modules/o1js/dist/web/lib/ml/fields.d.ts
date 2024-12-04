import { ConstantField, Field } from '../provable/field.js';
import { FieldVar, FieldConst } from '../provable/core/fieldvar.js';
import { MlArray } from './base.js';
export { MlFieldArray, MlFieldConstArray };
type MlFieldArray = MlArray<FieldVar>;
declare const MlFieldArray: {
    to(arr: Field[]): MlArray<FieldVar>;
    from([, ...arr]: MlArray<FieldVar>): Field[];
};
type MlFieldConstArray = MlArray<FieldConst>;
declare const MlFieldConstArray: {
    to(arr: Field[]): MlArray<FieldConst>;
    from([, ...arr]: MlArray<FieldConst>): ConstantField[];
};
