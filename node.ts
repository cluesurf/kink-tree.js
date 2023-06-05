import smc from '@cspotcode/source-map'
import {
  Link,
  HaltMesh,
  haveHalt,
  saveHalt,
  testHalt,
} from '@tunebond/halt'
import fs from 'fs'
import pathResolve from 'path'
import makeHaltBase, { MakeHalt, makeText, TONE } from './index.js'

export { makeText, haveHalt, saveHalt, testHalt, TONE }

export type { HaltMesh, Link }

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

export default function makeHalt<
  B,
  N extends keyof B & string = keyof B & string,
>(load: Omit<MakeHalt<B, N>, 'hook'>) {
  return makeHaltBase({ ...load, hook: readHostLinkFile })
}
