import tint from '@termsurf/tint-text';
export function makeLinkList(list, hook) {
    const noteLine = [];
    const linkList = [];
    let find = false;
    let i = list.length - 1;
    while (i >= 0) {
        const line = list[i--];
        if (!find && line?.startsWith('    at ')) {
            const link = readListLine(line.slice('    at '.length), hook);
            if (link) {
                linkList.push(link);
            }
        }
        else if (line) {
            find = true;
            noteLine.push(line);
        }
    }
    return { linkList: linkList.reverse(), note: noteLine };
}
export const makeTextHead = (note, code, host) => {
    const list = [];
    const R = { tone: 'red' };
    const RB = { tone: 'red', bold: true, line: true };
    const W = { tone: 'white' };
    const H = { tone: 'blackBright' };
    const C = { tone: 'cyan' };
    list.push(tint(`kink`, R) +
        ' ' +
        tint('<', H) +
        tint(`${note}`, RB) +
        tint('>', H));
    list.push('  ' + tint(`code <`, H) + tint(`${code}`, C) + tint(`>`, H));
    list.push('  ' + tint(`host `, H) + tint(`${host}`, H));
    return list;
};
/**
 * This you pass it a stack trace and it will render the error text.
 */
const makeText = ({ host, code, note, link = {}, list, hook, }) => {
    const textList = [];
    const W = { tone: 'white' };
    const WB = { tone: 'whiteBright' };
    const B = { tone: 'blue' };
    const M = { tone: 'magenta' };
    const MB = { tone: 'cyan', bold: true };
    const G = { tone: 'green' };
    const H = { tone: 'blackBright' };
    textList.push(...makeTextHead(note, code, host));
    textList.push(...makeLinkHash(link, 1));
    const { linkList } = makeLinkList(list, hook);
    linkList.forEach(link => {
        let head = [];
        if (link.line) {
            head.push(link.line);
        }
        if (link.code) {
            head.push(link.code);
        }
        const headText = head.length ? ':' + head.join(':') : '';
        const siteText = tint('site <', H);
        const fileText = tint(`${link.file}${headText}`, WB);
        textList.push(`  ${siteText}${fileText}${tint('>', H)}`);
        if (link.task) {
            const callText = '    ' + tint(`call <`, H);
            const taskText = tint(link.task, W);
            textList.push(`${callText}${taskText}${tint('>', H)}`);
        }
    });
    return textList.join('\n');
    function makeLinkHash(link, move) {
        const textList = [];
        const moveText = makeTextMove(move);
        for (const name in link) {
            const bond = link[name];
            if (bond === undefined) {
                textList.push(...makeLinkVoid(name, move));
            }
            else if (bond === null) {
                textList.push(...makeLinkNull(name, move));
            }
            else if (typeof bond === 'boolean') {
                textList.push(...makeLinkWave(name, bond, move));
            }
            else if (typeof bond === 'string') {
                textList.push(...makeLinkText(name, bond, move));
            }
            else if (typeof bond === 'number') {
                textList.push(...makeLinkSize(name, bond, move));
            }
            else if (Array.isArray(bond)) {
                bond.forEach(bond => {
                    textList.push(...makeLinkBond(name, bond, move));
                });
            }
            else if (typeof bond === 'object') {
                let base = true;
                for (const bondName in bond) {
                    const bind = bond[bondName];
                    if (base) {
                        base = false;
                        if (bind === undefined) {
                            textList.push(...makeLinkVoid(name, move));
                        }
                        else if (bind === null) {
                            textList.push(...makeLinkNull(name, move));
                        }
                        else if (typeof bind === 'boolean') {
                            textList.push(...makeLinkWave(name, bind, move));
                        }
                        else if (typeof bind === 'string') {
                            textList.push(...makeLinkText(name, bind, move));
                        }
                        else if (typeof bind === 'number') {
                            textList.push(...makeLinkSize(name, bind, move));
                        }
                        else if (Array.isArray(bind)) {
                            textList.push(`${moveText}${tint(`bind ${name}`, H)}`);
                            bind.forEach(bind => {
                                textList.push(...makeLinkBond(bondName, bind, move + 1));
                            });
                        }
                        else if (typeof bind === 'object') {
                            textList.push(`${moveText}${tint(`bind ${name}`, H)}`);
                            textList.push(...makeLinkBond(bondName, bind, move + 1));
                        }
                    }
                    else {
                        if (bind === undefined) {
                            textList.push(...makeLinkVoid(bondName, move + 1));
                        }
                        else if (bind === null) {
                            textList.push(...makeLinkNull(bondName, move + 1));
                        }
                        else if (typeof bind === 'boolean') {
                            textList.push(...makeLinkWave(bondName, bind, move + 1));
                        }
                        else if (typeof bind === 'string') {
                            textList.push(...makeLinkText(bondName, bind, move + 1));
                        }
                        else if (typeof bind === 'number') {
                            textList.push(...makeLinkSize(bondName, bind, move + 1));
                        }
                        else if (Array.isArray(bind)) {
                            bind.forEach(bind => {
                                textList.push(...makeLinkBond(bondName, bind, move + 1));
                            });
                        }
                        else if (typeof bind === 'object') {
                            textList.push(...makeLinkBond(bondName, bind, move + 1));
                        }
                    }
                }
            }
        }
        return textList;
    }
    function makeLinkBond(name, bond, move) {
        const textList = [];
        if (bond === undefined) {
            textList.push(...makeLinkVoid(name, move));
        }
        else if (bond === null) {
            textList.push(...makeLinkNull(name, move));
        }
        else if (typeof bond === 'boolean') {
            textList.push(...makeLinkWave(name, bond, move));
        }
        else if (typeof bond === 'string') {
            textList.push(...makeLinkText(name, bond, move));
        }
        else if (typeof bond === 'number') {
            textList.push(...makeLinkSize(name, bond, move));
        }
        else if (typeof bond === 'object') {
            const moveText = makeTextMove(move);
            textList.push(`${moveText}${tint(`bind ${name}`, H)}`);
            textList.push(...makeLinkHash(bond, move + 1));
        }
        return textList;
    }
    function makeLinkVoid(name, move) {
        const textList = [];
        // const moveText = makeTextMove(move)
        // textList.push(
        //   `${moveText}${tint(`${name} <`, H)}${tint('void', B)}${tint(
        //     `>`,
        //     H,
        //   )}`,
        // )
        return textList;
    }
    function makeLinkNull(name, move) {
        const textList = [];
        const moveText = makeTextMove(move);
        textList.push(`${moveText}${tint(`bind`, H)} ${tint(name, W)}${tint(`,`, H)} ${tint('null', MB)}`);
        return textList;
    }
    function makeLinkSize(name, bond, move) {
        const textList = [];
        const moveText = makeTextMove(move);
        textList.push(`${moveText}${tint(`bind`, H)} ${tint(name, W)}${tint(`,`, H)} ${tint(String(bond), G)}`);
        return textList;
    }
    function makeLinkWave(name, bond, move) {
        const textList = [];
        const moveText = makeTextMove(move);
        textList.push(`${moveText}${tint(`bind`, H)} ${tint(name, W)}${tint(`,`, H)} ${tint(String(bond), B)}`);
        return textList;
    }
    function makeLinkText(name, bond, move) {
        const textList = [];
        const moveText = makeTextMove(move);
        if (bond.match(/\n/)) {
            textList.push(`${moveText}${tint(`bind`, H)} ${tint(name, W)}${tint(`, <`, H)}`);
            bond.split(/\n/).forEach(line => {
                const moveNest = move + 1;
                const moveNestText = makeTextMove(moveNest);
                textList.push(`${moveNestText}${tint(line, M)}`);
            });
            textList.push(`${moveText}${tint(`>`, H)}`);
        }
        else {
            textList.push(`${moveText}${tint(`bind`, H)} ${tint(name, W)}${tint(`, <`, H)}${tint(bond, M)}${tint(`>`, H)}`);
        }
        return textList;
    }
};
export default makeText;
export function readListLine(text, hook) {
    const [a, b] = text.trim().split(/\s+/);
    if (a && !b) {
        return readListLineFile(a, hook);
    }
    else if (a && b) {
        return {
            ...readListLineFile(b, hook),
            task: a,
        };
    }
}
export function readListLineFile(text, hook) {
    const list = text.replace(/[\(\)]/g, '').split(':');
    const code = list.pop();
    let codeMark = code ? parseInt(code, 10) : undefined;
    const line = list.pop();
    let lineMark = line ? parseInt(line, 10) : undefined;
    let file = list.join(':');
    if (hook &&
        typeof lineMark === 'number' &&
        typeof codeMark === 'number') {
        ;
        [file, lineMark, codeMark] = hook(file, lineMark, codeMark);
    }
    return {
        code: codeMark,
        file,
        line: lineMark,
    };
}
function makeTextMove(move) {
    return new Array(move + 1).join('  ');
}
//# sourceMappingURL=index.js.map