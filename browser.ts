import Kink from '@termsurf/kink'
import makeText from './index.js'

export { makeText }

export function makeKinkText(kink: Kink): string {
  return makeText({
    host: kink.host,
    code: kink.code,
    note: kink.note,
    list: kink.stack?.split('\n') ?? [],
  })
}

export function makeBaseKinkText(kink: Error): string {
  return makeText(Kink.makeBase(kink))
}
