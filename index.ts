import tint from '@tunebond/tint'
import Halt, { Make } from '@tunebond/halt'

export type HaltTone = 'rise' | 'fall'

export const TONE: Record<HaltTone, Record<string, string>> = {
  fall: {
    base: '#ffffff',
    blue: '#82cdf0',
    gray: '#bebebe',
    green: '#8dd484',
    purple: '#cc9aff',
    red: '#f08296',
    yellow: '#f0dc82',
  },
  rise: {
    base: '#080808',
    blue: '#2db6f3',
    gray: '#808080',
    green: '#26c64f',
    purple: '#af77e7',
    red: '#ff6961',
    yellow: '#ebc300',
  },
}

export type LineListLink = {
  code?: number
  file: string
  line?: number
  task?: string
}

export function makeLinkList(list: Array<string>) {
  const noteLine: Array<string> = []
  const linkList: Array<LineListLink> = []
  // const list = text.trim().split(/\n+/)

  let find = false
  let i = list.length - 1
  while (i >= 0) {
    const line = list[i--]
    if (!find && line?.startsWith('    at ')) {
      const link = readListLine(line.slice('    at '.length))
      if (link) {
        linkList.push(link)
      }
    } else if (line) {
      find = true
      noteLine.push(line)
    }
  }

  return { linkList, note: noteLine }
}

export const makeTextHead = (
  note: string,
  code: string,
  host: string,
  tone: HaltTone,
) => {
  const list: Array<string> = []

  const T = TONE[tone]
  const G = { tone: T.green }
  const P = { tone: T.purple }
  const V = { tone: T.base } // chalk.whiteBright
  const VB = { bold: true, tone: T.base }
  const H = { tone: T.gray }

  list.push(``)
  list.push(tint(`  note <`, H) + tint(`${note}`, P) + tint('>', H))
  list.push(tint(`    code <`, H) + tint(`${code}`, G) + tint(`>`, H))
  list.push(tint(`    host <`, H) + tint(`${host}`, H) + tint(`>`, H))
  return list
}

/**
 * This you pass it a stack trace and it will render the error text.
 */

export const makeText = (
  host: string,
  code: string,
  note: string,
  link: Array<string>,
  tone: HaltTone = 'fall',
) => {
  const list: Array<string> = []

  const T = TONE[tone]
  const V = { tone: T.base }
  const VB = { bold: true, tone: T.base }
  const H = { tone: T.gray }

  list.push(...makeTextHead(note, code, host, tone))

  const { linkList } = makeLinkList(link)

  linkList.forEach(link => {
    let head = []
    if (link.line) {
      head.push(link.line)
    }
    if (link.code) {
      head.push(link.code)
    }

    const headText = head.length ? ':' + head.join(':') : ''
    const siteText = tint('site <', H)
    const fileText = tint(`${link.file}${headText}`, VB)
    list.push(`  ${siteText}${fileText}${tint('>', H)}`)

    if (link.task) {
      const callText = tint(`    call <`, H)
      const taskText = tint(link.task, V)
      list.push(`${callText}${taskText}${tint('>', H)}`)
    }
  })

  list.push(``)

  return list.join('\n')
}

export function readListLine(text: string) {
  const [a, b] = text.trim().split(/\s+/)
  if (a && !b) {
    return readListLineFile(a)
  } else if (a && b) {
    return {
      ...readListLineFile(b),
      task: a,
    }
  }
}

export function readListLineFile(text: string): LineListLink {
  const list = text.replace(/[\(\)]/g, '').split(':')
  const code = list.pop()
  let codeMark = code ? parseInt(code, 10) : undefined
  const line = list.pop()
  let lineMark = line ? parseInt(line, 10) : undefined
  let file = list.join(':')
  // if (code.isNumber(lineMark) && code.isNumber(codeMark)) {
  //   ;[file, lineMark, codeMark] = getSourceMappedFile(
  //     file,
  //     lineMark,
  //     codeMark,
  //   )
  // }
  return {
    code: codeMark,
    file,
    line: lineMark,
  }
}

export function makeBaseText(
  host: string,
  code: string,
  note: string,
  tone: HaltTone,
) {
  return makeTextHead(note, code, host, tone).join('\n')
}

export type HostLinkHook = (
  file: string,
  line: number,
  rise: number,
) => [string, number | undefined, number | undefined]

export function saveLinkList(
  halt: Error,
  list: Array<NodeJS.CallSite>,
  tone: HaltTone,
  hook?: HostLinkHook,
) {
  const T = TONE[tone]
  const V = { tone: T.base }
  const B = { tone: T.blue }
  const VB = { bold: true, tone: T.base }
  const H = { tone: T.gray }

  return (
    halt.message +
    '\n' +
    list
      .slice(1)
      .map((site: NodeJS.CallSite) => {
        let x = site.getFileName()
        let a: number | null | undefined = site.getLineNumber()
        let b: number | null | undefined = site.getColumnNumber()

        if (
          hook &&
          x &&
          typeof a === 'number' &&
          typeof b === 'number' &&
          typeof x === 'string'
        ) {
          ;[x, a, b] = hook(x, a, b)
        }

        let m = site.getMethodName()?.trim()
        let f = site.getFunctionName()?.trim()
        let t = site.getTypeName()?.trim()
        let hint = m
          ? [t, m].join('.')
          : t
          ? [t, f].join('.')
          : f || 'anonymous'
        hint = hint ? hint : ''
        const lastLines: Array<string> = []
        if (x) {
          lastLines.push(
            tint('    site <', H) +
              tint([x, a, b].filter(x => x).join(':'), B) +
              tint('>', H),
          )
        } else {
          lastLines.push(tint('    site <unknown>', H))
        }

        lastLines.push(
          tint('      call <', H) + tint(hint, V) + tint('>', V),
        )

        return lastLines.join('\n')
      })
      .join('\n') +
    '\n'
  )
}

export type MakeHalt<
  B,
  N extends keyof B & string = keyof B & string,
> = Make<B, N> & {
  hook?: HostLinkHook
  tone?: HaltTone
  head?: string
}

export default function makeHalt<
  B,
  N extends keyof B & string = keyof B & string,
>({
  base,
  host,
  form,
  code,
  link = {},
  tone = 'fall',
  hook,
  head = '',
}: MakeHalt<B, N>) {
  // Error.stackTraceLimit = Infinity

  const prepareStackTrace = Error.prepareStackTrace

  Error.prepareStackTrace = function prepareStackTrace(
    halt: Error,
    list: Array<NodeJS.CallSite>,
  ) {
    return saveLinkList(halt, list, tone, hook)
  }

  const text = (host: string, code: string, note: string) =>
    makeBaseText(host, code, note, tone) + head

  const halt = new Halt({
    base,
    code,
    form,
    host,
    link,
    text,
  })
  halt.name = ''

  Error.captureStackTrace(halt)

  halt.stack

  Error.prepareStackTrace = prepareStackTrace

  return halt
}
