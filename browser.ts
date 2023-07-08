import Kink from '@tunebond/kink'
import makeText from './index.js'

export { makeText }

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

export function makeBaseKinkText(kink: Error) {
  return makeText({
    host: 'node',
    code: 'code' in kink && typeof kink.code === 'string' ? kink.code : '0000',
    note: kink.message,
    list: kink.stack?.split('\n') ?? [],
  })
}
