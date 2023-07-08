import tint from '@tunebond/tint-text'

export type LineListLink = {
  code?: number
  file: string
  line?: number
  task?: string
}

export function makeLinkList(list: Array<string>, hook?: HostLinkHook) {
  const noteLine: Array<string> = []
  const linkList: Array<LineListLink> = []

  let find = false
  let i = list.length - 1
  while (i >= 0) {
    const line = list[i--]
    if (!find && line?.startsWith('    at ')) {
      const link = readListLine(line.slice('    at '.length), hook)
      if (link) {
        linkList.push(link)
      }
    } else if (line) {
      find = true
      noteLine.push(line)
    }
  }

  return { linkList: linkList.reverse(), note: noteLine }
}

export const makeTextHead = (
  note: string,
  code: string,
  host: string,
) => {
  const list: Array<string> = []

  const R = { tone: 'red' }
  const P = { tone: 'white' }
  const H = { tone: 'blackBright' }

  list.push(``)
  list.push(tint(`  note <`, H) + tint(`${note}`, R) + tint('>', H))
  list.push(tint(`    code <`, H) + tint(`${code}`, P) + tint(`>`, H))
  list.push(tint(`    host <`, H) + tint(`${host}`, H) + tint(`>`, H))
  return list
}

export type MakeText = {
  host: string
  code: string
  note: string
  hint?: string
  text?: string
  file?: string
  link?: Record<string, unknown>
  // stack trace
  list: Array<string>
  hook?: HostLinkHook
}

/**
 * This you pass it a stack trace and it will render the error text.
 */

const makeText = ({
  host,
  code,
  note,
  list,
  hint,
  file,
  text,
  hook,
}: MakeText) => {
  const textList: Array<string> = []

  const V = { tone: 'white' }
  const B = { tone: 'blue' }
  const VB = { tone: 'whiteBright' }
  const H = { tone: 'blackBright' }
  const Y = { tone: 'yellow' }

  textList.push(...makeTextHead(note, code, host))

  if (file && text) {
    textList.push(tint(`  file <${file}>, <`, H))
    text.split(/\n/).forEach(line => {
      textList.push(`    ${line}`)
    })
    textList.push(tint(`  >`, H))
  } else if (text) {
    textList.push(tint(`  text <`, H))
    text.split(/\n/).forEach(line => {
      textList.push(`    ${line}`)
    })
    textList.push(tint(`  >`, H))
  }

  if (hint) {
    textList.push(tint(`  hint <`, H) + tint(hint, Y) + tint(`>`, H))
  }

  const { linkList } = makeLinkList(list, hook)

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
    const fileText = tint(`${link.file}${headText}`, B)
    textList.push(`  ${siteText}${fileText}${tint('>', H)}`)

    if (link.task) {
      const callText = tint(`    call <`, H)
      const taskText = tint(link.task, V)
      textList.push(`${callText}${taskText}${tint('>', H)}`)
    }
  })

  textList.push(``)

  return textList.join('\n')
}

export default makeText

export function readListLine(text: string, hook?: HostLinkHook) {
  const [a, b] = text.trim().split(/\s+/)
  if (a && !b) {
    return readListLineFile(a, hook)
  } else if (a && b) {
    return {
      ...readListLineFile(b, hook),
      task: a,
    }
  }
}

export function readListLineFile(
  text: string,
  hook?: HostLinkHook,
): LineListLink {
  const list = text.replace(/[\(\)]/g, '').split(':')
  const code = list.pop()
  let codeMark = code ? parseInt(code, 10) : undefined
  const line = list.pop()
  let lineMark = line ? parseInt(line, 10) : undefined
  let file = list.join(':')
  if (
    hook &&
    typeof lineMark === 'number' &&
    typeof codeMark === 'number'
  ) {
    ;[file, lineMark, codeMark] = hook(file, lineMark, codeMark)
  }
  return {
    code: codeMark,
    file,
    line: lineMark,
  }
}

export function makeBaseText(host: string, code: string, note: string) {
  return makeTextHead(note, code, host).join('\n')
}

export type HostLinkHook = (
  file: string,
  line: number,
  rise: number,
) => [string, number | undefined, number | undefined]

// export function saveLinkList(
//   halt: Error,
//   list: Array<NodeJS.CallSite>,
//   hook?: HostLinkHook,
// ) {
//   const V = { tone: T.base }
//   const B = { tone: T.blue }
//   const VB = { bold: true, tone: T.base }
//   const H = { tone: T.gray }

//   return (
//     halt.message +
//     '\n' +
//     list
//       .slice(1)
//       .map((site: NodeJS.CallSite) => {
//         let x = site.getFileName()
//         let a: number | null | undefined = site.getLineNumber()
//         let b: number | null | undefined = site.getColumnNumber()

//         if (
//           hook &&
//           x &&
//           typeof a === 'number' &&
//           typeof b === 'number' &&
//           typeof x === 'string'
//         ) {
//           ;[x, a, b] = hook(x, a, b)
//         }

//         let m = site.getMethodName()?.trim()
//         let f = site.getFunctionName()?.trim()
//         let t = site.getTypeName()?.trim()
//         let hint = m
//           ? [t, m].join('.')
//           : t
//           ? [t, f].join('.')
//           : f || 'anonymous'
//         hint = hint ? hint : ''
//         const lastLines: Array<string> = []
//         if (x) {
//           lastLines.push(
//             tint('    site <', H) +
//               tint([x, a, b].filter(x => x).join(':'), B) +
//               tint('>', H),
//           )
//         } else {
//           lastLines.push(tint('    site <unknown>', H))
//         }

//         lastLines.push(
//           tint('      call <', H) + tint(hint, V) + tint('>', V),
//         )

//         return lastLines.join('\n')
//       })
//       .join('\n') +
//     '\n'
//   )
// }
