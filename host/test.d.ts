import Kink from '@termsurf/kink';
type Base = {
    syntax_error: {};
};
type Name = keyof Base;
export default function kink<N extends Name>(form: N, link?: Base[N]): Kink;
export {};
