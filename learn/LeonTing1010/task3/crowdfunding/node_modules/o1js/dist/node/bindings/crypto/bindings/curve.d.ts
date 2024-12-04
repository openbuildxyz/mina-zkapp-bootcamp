/**
 * TS implementation of Pasta_bindings.{Pallas, Vesta}
 */
import { MlPair } from '../../../lib/ml/base.js';
import { Field } from './field.js';
import { GroupProjective, GroupAffine } from '../elliptic-curve.js';
export { VestaBindings, PallasBindings, Infinity, OrInfinity, OrInfinityJson, toMlOrInfinity, fromMlOrInfinity, };
declare const VestaBindings: {
    caml_vesta_sub: (g: GroupProjective, h: GroupProjective) => GroupProjective;
    caml_vesta_add: (g: GroupProjective, h: GroupProjective) => GroupProjective;
    caml_vesta_negate: (g: GroupProjective) => {
        x: bigint;
        y: bigint;
        z: bigint;
    };
    caml_vesta_scale: (g: GroupProjective, [, s]: Field) => GroupProjective;
    caml_vesta_one: () => GroupProjective;
    caml_vesta_random: () => GroupProjective;
    caml_vesta_rng: (i: number) => GroupProjective;
    caml_vesta_double: (g: GroupProjective) => GroupProjective;
    caml_vesta_endo_base: () => Field;
    caml_vesta_endo_scalar: () => Field;
    caml_vesta_to_affine: (g: GroupProjective) => OrInfinity;
    caml_vesta_of_affine: (g: OrInfinity) => GroupProjective;
    caml_vesta_of_affine_coordinates: (x: Field, y: Field) => GroupProjective;
    caml_vesta_affine_deep_copy: (g: OrInfinity) => OrInfinity;
};
declare const PallasBindings: {
    caml_pallas_sub: (g: GroupProjective, h: GroupProjective) => GroupProjective;
    caml_pallas_add: (g: GroupProjective, h: GroupProjective) => GroupProjective;
    caml_pallas_negate: (g: GroupProjective) => {
        x: bigint;
        y: bigint;
        z: bigint;
    };
    caml_pallas_scale: (g: GroupProjective, [, s]: Field) => GroupProjective;
    caml_pallas_one: () => GroupProjective;
    caml_pallas_random: () => GroupProjective;
    caml_pallas_rng: (i: number) => GroupProjective;
    caml_pallas_double: (g: GroupProjective) => GroupProjective;
    caml_pallas_endo_base: () => Field;
    caml_pallas_endo_scalar: () => Field;
    caml_pallas_to_affine: (g: GroupProjective) => OrInfinity;
    caml_pallas_of_affine: (g: OrInfinity) => GroupProjective;
    caml_pallas_of_affine_coordinates: (x: Field, y: Field) => GroupProjective;
    caml_pallas_affine_deep_copy: (g: OrInfinity) => OrInfinity;
};
type Infinity = 0;
declare const Infinity = 0;
type Finite<T> = [0, T];
type OrInfinity = Infinity | Finite<MlPair<Field, Field>>;
declare function toMlOrInfinity(g: GroupAffine): OrInfinity;
declare function fromMlOrInfinity(g: OrInfinity): GroupAffine;
type OrInfinityJson = 'Infinity' | {
    x: string;
    y: string;
};
declare const OrInfinity: {
    toJSON(g: OrInfinity): OrInfinityJson;
    fromJSON(g: OrInfinityJson): OrInfinity;
};
