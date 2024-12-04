import type { SmartContract } from './zkapp.js';
import type { AccountUpdate, AccountUpdateLayout } from './account-update.js';
import { Context } from '../util/global-context.js';
export { smartContractContext, SmartContractContext, accountUpdateLayout, contract, };
type SmartContractContext = {
    this: SmartContract;
    selfUpdate: AccountUpdate;
    selfLayout: AccountUpdateLayout;
};
declare let smartContractContext: Context.t<SmartContractContext | null>;
declare function accountUpdateLayout(): AccountUpdateLayout | undefined;
declare function contract<S extends SmartContract>(expectedConstructor?: new (...args: any) => S): S;
