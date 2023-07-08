import smc from '@cspotcode/source-map'
import Kink from '@tunebond/kink'
import fs from 'fs'
import pathResolve from 'path'
import makeText from './index.js'

const HOST_LINK_MESH: Record<string, smc.SourceMapConsumer> = {}

export function loadHostLink(
  line: string,
): smc.SourceMapConsumer | void {
  const link = HOST_LINK_MESH[`${line}`]
  if (link) {
    return link
  }

  const fileLink = line.replace(/^file:\/\//, '')

  if (fs.existsSync(`${fileLink}.map`)) {
    const mapContent = fs.readFileSync(`${fileLink}.map`, 'utf-8')
    const json = JSON.parse(mapContent) as smc.RawSourceMap
    const sm = new smc.SourceMapConsumer(json)
    HOST_LINK_MESH[`${line}`] = sm
    return sm
  }
}

export function readLink(path: string, context: string): string {
  const relative = pathResolve.relative(
    process.cwd(),
    pathResolve.resolve(context, path),
  )
  return relative.startsWith('.') ? relative : `./${relative}`
}

export function readHostLinkFile(
  file: string,
  line: number,
  rise: number,
): [string, number | undefined, number | undefined] {
  const link = loadHostLink(file)

  const trace = {
    column: rise,
    filename: file,
    line: line,
  }

  if (link) {
    const token = link.originalPositionFor(trace)
    if (token.source) {
      return [
        readLink(
          token.source,
          pathResolve.dirname(file.replace(/^file:\/\//, '')),
        ),
        token.line == null ? undefined : token.line,
        token.column == null ? undefined : token.column,
      ]
    } else {
      return [file, line, rise]
    }
  } else {
    return [file, line, rise]
  }
}

export function makeKinkText(kink: Kink) {
  return makeText({
    host: kink.host,
    code: kink.code,
    note: kink.note,
    list: kink.stack?.split('\n') ?? [],
    file: typeof kink.link.file === 'string' ? kink.link.file : undefined,
    text: typeof kink.link.text === 'string' ? kink.link.text : undefined,
    hint: typeof kink.link.hint === 'string' ? kink.link.hint : undefined,
    link: kink.link,
  })
}
