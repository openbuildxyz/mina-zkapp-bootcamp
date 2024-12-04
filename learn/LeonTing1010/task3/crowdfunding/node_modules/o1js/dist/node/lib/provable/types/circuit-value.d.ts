import 'reflect-metadata';
import { Field } from '../wrapped.js';
import { HashInput, NonMethods } from './provable-derivers.js';
import { AnyConstructor, FlexibleProvable } from './struct.js';
export { CircuitValue, prop, arrayProp };
/**
 * @deprecated `CircuitValue` is deprecated in favor of {@link Struct}, which features a simpler API and better typing.
 */
declare abstract class CircuitValue {
    constructor(...props: any[]);
    static fromObject<T extends AnyConstructor>(this: T, value: NonMethods<InstanceType<T>>): InstanceType<T>;
    static sizeInFields(): number;
    static toFields<T extends AnyConstructor>(this: T, v: InstanceType<T>): Field[];
    static toAuxiliary(): [];
    static toInput<T extends AnyConstructor>(this: T, v: InstanceType<T>): HashInput;
    toFields(): Field[];
    static toValue<T extends AnyConstructor>(this: T, v: InstanceType<T>): any;
    static fromValue<T extends AnyConstructor>(this: T, value: any): InstanceType<T>;
    toJSON(): any;
    toConstant(): this;
    equals(x: this): import("../bool.js").Bool;
    assertEquals(x: this): void;
    isConstant(): boolean;
    static fromFields<T extends AnyConstructor>(this: T, xs: Field[]): InstanceType<T>;
    static check<T extends AnyConstructor>(this: T, v: InstanceType<T>): void;
    static toCanonical<T extends AnyConstructor>(this: T, value: InstanceType<T>): InstanceType<T>;
    static toConstant<T extends AnyConstructor>(this: T, t: InstanceType<T>): InstanceType<T>;
    static toJSON<T extends AnyConstructor>(this: T, v: InstanceType<T>): any;
    static fromJSON<T extends AnyConstructor>(this: T, value: any): InstanceType<T>;
    static empty<T extends AnyConstructor>(): InstanceType<T>;
}
declare function prop(this: any, target: any, key: string): void;
declare function arrayProp<T>(elementType: FlexibleProvable<T>, length: number): (target: any, key: string) => void;
