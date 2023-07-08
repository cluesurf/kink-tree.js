import Kink from '@tunebond/kink'
import fs from 'fs'
import { makeKinkText, makeBaseKinkText } from './node.js'

const host = '@tunebond/kink-text'

type Base = {
  syntax_error: {}
}

type Name = keyof Base

Kink.base(host, 'syntax_error', () => ({
  code: 1,
  note: 'Syntax error'
}))

Kink.code(host, (code: number) => code.toString(16).padStart(4, '0'))

export default function kink<N extends Name>(form: N, link?: Base[N]) {
  return new Kink(Kink.makeBase(host, form, link))
}

// https://nodejs.org/api/errors.html
process.on('uncaughtException', err => {
  if (err instanceof Kink) {
    console.log(makeKinkText(err))
  } else {
    console.log(makeBaseKinkText(err))
  }
})

setTimeout(() => {
  throw kink('syntax_error')
})

setTimeout(() => {
  fs.readFileSync('.')
})

