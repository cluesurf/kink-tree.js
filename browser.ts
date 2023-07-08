import Kink from '@tunebond/kink'
import makeText from './index.js'

export { makeText }

export function makeKinkText(kink: Kink) {
  return makeText({
    host: kink.host,
    code: kink.code,
    note: kink.note,
    list: kink.stack?.split('\n') ?? [],
    file: typeof kink.file === 'string' ? kink.file : undefined,
    text: typeof kink.text === 'string' ? kink.text : undefined,
    hint: typeof kink.hint === 'string' ? kink.hint : undefined,
    link: kink.link,
  })
}

export function makeBaseKinkText(kink: Error) {
  return makeText({
    host: 'node',
    code:
      'code' in kink && typeof kink.code === 'string'
        ? kink.code
        : '0000',
    note: kink.message,
    list: kink.stack?.split('\n') ?? [],
  })
}
