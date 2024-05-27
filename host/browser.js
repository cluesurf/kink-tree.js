import Kink from '@termsurf/kink';
import makeText from './index.js';
export * from './index.js';
export { makeText };
export function makeKinkText(kink) {
    return makeText({
        host: kink.host,
        code: kink.code,
        note: kink.note,
        list: kink.stack?.split('\n') ?? [],
    });
}
export function makeBaseKinkText(kink) {
    return makeText(Kink.makeBase(kink));
}
//# sourceMappingURL=browser.js.map