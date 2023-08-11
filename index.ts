import tint from '@nerdbond/tint-text'

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
  const W = { tone: 'white' }
  const H = { tone: 'blackBright' }

  list.push(tint(`  kink <`, H) + tint(`${note}`, R) + tint('>', H))
  list.push(tint(`  code <`, H) + tint(`${code}`, W) + tint(`>`, H))
  list.push(tint(`  host <`, H) + tint(`${host}`, H) + tint(`>`, H))
  return list
}

export type MakeText = {
  host: string
  code: string
  note: string
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
  link = {},
  list,
  hook,
}: MakeText) => {
  const textList: Array<string> = []

  const W = { tone: 'white' }
  const WB = { tone: 'whiteBright' }
  const B = { tone: 'blue' }
  const G = { tone: 'green' }
  const H = { tone: 'blackBright' }

  textList.push(...makeTextHead(note, code, host))

  textList.push(...makeLinkHash(link, 1))

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
    const fileText = tint(`${link.file}${headText}`, WB)
    textList.push(`  ${siteText}${fileText}${tint('>', H)}`)

    if (link.task) {
      const callText = tint(`    call <`, H)
      const taskText = tint(link.task, W)
      textList.push(`${callText}${taskText}${tint('>', H)}`)
    }
  })

  return textList.join('\n')

  function makeLinkHash(link: Record<string, unknown>, move: number) {
    const textList: Array<string> = []
    const moveText = makeTextMove(move)

    for (const name in link) {
      const bond = link[name]
      if (bond === undefined) {
        textList.push(...makeLinkVoid(name, move))
      } else if (bond === null) {
        textList.push(...makeLinkNull(name, move))
      } else if (typeof bond === 'boolean') {
        textList.push(...makeLinkWave(name, bond, move))
      } else if (typeof bond === 'string') {
        textList.push(...makeLinkText(name, bond, move))
      } else if (typeof bond === 'number') {
        textList.push(...makeLinkSize(name, bond, move))
      } else if (Array.isArray(bond)) {
        bond.forEach(bond => {
          textList.push(...makeLinkBond(name, bond, move))
        })
      } else if (typeof bond === 'object') {
        let base = true
        for (const bondName in bond) {
          const bind = (bond as Record<string, unknown>)[bondName]
          if (base) {
            base = false
            if (bind === undefined) {
              textList.push(...makeLinkVoid(name, move))
            } else if (bind === null) {
              textList.push(...makeLinkNull(name, move))
            } else if (typeof bind === 'boolean') {
              textList.push(...makeLinkWave(name, bind, move))
            } else if (typeof bind === 'string') {
              textList.push(...makeLinkText(name, bind, move))
            } else if (typeof bind === 'number') {
              textList.push(...makeLinkSize(name, bind, move))
            } else if (Array.isArray(bind)) {
              textList.push(`${moveText}${tint(`${name}`, H)}`)
              bind.forEach(bind => {
                textList.push(...makeLinkBond(bondName, bind, move + 1))
              })
            } else if (typeof bind === 'object') {
              textList.push(`${moveText}${tint(`${name}`, H)}`)
              textList.push(...makeLinkBond(bondName, bind, move + 1))
            }
          } else {
            if (bind === undefined) {
              textList.push(...makeLinkVoid(bondName, move + 1))
            } else if (bind === null) {
              textList.push(...makeLinkNull(bondName, move + 1))
            } else if (typeof bind === 'boolean') {
              textList.push(...makeLinkWave(bondName, bind, move + 1))
            } else if (typeof bind === 'string') {
              textList.push(...makeLinkText(bondName, bind, move + 1))
            } else if (typeof bind === 'number') {
              textList.push(...makeLinkSize(bondName, bind, move + 1))
            } else if (Array.isArray(bind)) {
              bind.forEach(bind => {
                textList.push(...makeLinkBond(bondName, bind, move + 1))
              })
            } else if (typeof bind === 'object') {
              textList.push(...makeLinkBond(bondName, bind, move + 1))
            }
          }
        }
      }
    }

    return textList
  }

  function makeLinkBond(name: string, bond: unknown, move: number) {
    const textList: Array<string> = []
    if (bond === undefined) {
      textList.push(...makeLinkVoid(name, move))
    } else if (bond === null) {
      textList.push(...makeLinkNull(name, move))
    } else if (typeof bond === 'boolean') {
      textList.push(...makeLinkWave(name, bond, move))
    } else if (typeof bond === 'string') {
      textList.push(...makeLinkText(name, bond, move))
    } else if (typeof bond === 'number') {
      textList.push(...makeLinkSize(name, bond, move))
    } else if (typeof bond === 'object') {
      const moveText = makeTextMove(move)
      textList.push(`${moveText}${tint(`${name}`, H)}`)
      textList.push(
        ...makeLinkHash(bond as Record<string, unknown>, move + 1),
      )
    }
    return textList
  }

  function makeLinkVoid(name: string, move: number) {
    const textList: Array<string> = []
    // const moveText = makeTextMove(move)
    // textList.push(
    //   `${moveText}${tint(`${name} <`, H)}${tint('void', B)}${tint(
    //     `>`,
    //     H,
    //   )}`,
    // )
    return textList
  }

  function makeLinkNull(name: string, move: number) {
    const textList: Array<string> = []
    const moveText = makeTextMove(move)
    textList.push(
      `${moveText}${tint(`${name} <`, H)}${tint('null', B)}${tint(
        `>`,
        H,
      )}`,
    )
    return textList
  }

  function makeLinkSize(name: string, bond: number, move: number) {
    const textList: Array<string> = []
    const moveText = makeTextMove(move)
    textList.push(
      `${moveText}${tint(`${name} <`, H)}${tint(String(bond), G)}${tint(
        `>`,
        H,
      )}`,
    )
    return textList
  }

  function makeLinkWave(name: string, bond: boolean, move: number) {
    const textList: Array<string> = []
    const moveText = makeTextMove(move)
    textList.push(
      `${moveText}${tint(`${name} <`, H)}${tint(String(bond), B)}${tint(
        `>`,
        H,
      )}`,
    )
    return textList
  }

  function makeLinkText(name: string, bond: string, move: number) {
    const textList: Array<string> = []
    const moveText = makeTextMove(move)
    if (bond.match(/\n/)) {
      textList.push(`${moveText}${tint(`${name} <`, H)}`)
      bond.split(/\n/).forEach(line => {
        const moveNest = move + 1
        const moveNestText = makeTextMove(moveNest)
        textList.push(`${moveNestText}${line}`)
      })
      textList.push(`${moveText}${tint(`>`, H)}`)
    } else {
      textList.push(
        `${moveText}${tint(`${name} <`, H)}${tint(bond, B)}${tint(
          `>`,
          H,
        )}`,
      )
    }
    return textList
  }
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

export type HostLinkHook = (
  file: string,
  line: number,
  rise: number,
) => [string, number | undefined, number | undefined]

function makeTextMove(move: number) {
  return new Array(move + 1).join('  ')
}
