import { ProvableType } from './provable-intf.js';
export { emptyWitness };
declare function emptyWitness<T>(type: ProvableType<T>): T;
