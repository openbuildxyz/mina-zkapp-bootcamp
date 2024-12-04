import { Types } from '../../bindings/mina-transaction/types.js';
export { humanizeErrors, invalidTransactionError };
type ErrorReplacementRule = {
    pattern: RegExp;
    replacement: string;
};
declare function invalidTransactionError(transaction: Types.ZkappCommand, errors: string[][][], additionalContext: {
    accountCreationFee: string | number;
}): string;
declare function humanizeErrors(errors: string[], replacements?: ErrorReplacementRule[]): string[];
