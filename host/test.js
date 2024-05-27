import Kink from '@termsurf/kink';
import fs from 'fs';
import { makeKinkText, makeBaseKinkText } from './node.js';
const host = '@termsurf/kink-text';
Kink.base(host, 'syntax_error', () => ({
    code: 1,
    note: 'Syntax error',
}));
Kink.code(host, (code) => code.toString(16).padStart(4, '0'));
export default function kink(form, link) {
    return Kink.make(host, form, link);
}
console.log('');
console.log('');
console.log('');
// https://nodejs.org/api/errors.html
process.on('uncaughtException', err => {
    if (err instanceof Kink) {
        // Kink.saveFill(err, err.link)
        console.log(makeKinkText(err));
    }
    else {
        console.log(makeBaseKinkText(err));
        console.log('');
        console.log('');
        console.log('');
    }
});
setTimeout(() => {
    throw kink('syntax_error');
});
setTimeout(() => {
    fs.readFileSync('.');
});
//# sourceMappingURL=test.js.map