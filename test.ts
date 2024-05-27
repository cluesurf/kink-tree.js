import Kink from '@termsurf/kink'
import fs from 'fs'
import { makeKinkText, makeBaseKinkText } from './node.js'

const host = '@termsurf/kink-text'

type Base = {
  syntax_error: {}
}

type Name = keyof Base

Kink.base(host, 'syntax_error', () => ({
  code: 1,
  note: 'Syntax error',
}))

Kink.code(host, (code: number) => code.toString(16).padStart(4, '0'))

export default function kink<N extends Name>(form: N, link?: Base[N]) {
  return Kink.make(host, form, link)
}

console.log('')
console.log('')
console.log('')

// https://nodejs.org/api/errors.html
process.on('uncaughtException', err => {
  if (err instanceof Kink) {
    // Kink.saveFill(err, err.link)
    console.log(makeKinkText(err))
  } else {
    console.log(makeBaseKinkText(err))

    console.log('')
    console.log('')
    console.log('')
  }
})

setTimeout(() => {
  throw kink('syntax_error')
})

setTimeout(() => {
  fs.readFileSync('.')
})
