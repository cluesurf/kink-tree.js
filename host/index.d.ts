export type LineListLink = {
    code?: number;
    file: string;
    line?: number;
    task?: string;
};
export declare function makeLinkList(list: Array<string>, hook?: HostLinkHook): {
    linkList: LineListLink[];
    note: string[];
};
export declare const makeTextHead: (note: string, code: string, host: string) => string[];
export type MakeText = {
    host: string;
    code: string;
    note: string;
    link?: Record<string, unknown>;
    list: Array<string>;
    hook?: HostLinkHook;
};
/**
 * This you pass it a stack trace and it will render the error text.
 */
declare const makeText: ({ host, code, note, link, list, hook, }: MakeText) => string;
export default makeText;
export declare function readListLine(text: string, hook?: HostLinkHook): LineListLink | undefined;
export declare function readListLineFile(text: string, hook?: HostLinkHook): LineListLink;
export type HostLinkHook = (file: string, line: number, rise: number) => [string, number | undefined, number | undefined];
