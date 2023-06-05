import { Link } from '@tunebond/halt'
import makeHalt from './node.js'

type WithName = {
  name: string
}

type WithType = WithName & {
  type: string
}

const host = '@tunebond/halt-text'

const base = {
  invalid_form: {
    code: 3,
    note: ({ name }: WithName) => `Form '${name}' is not valid`,
  },
  invalid_type: {
    code: 2,
    note: ({ name, type }: WithType) =>
      `Value '${name}' is not '${type}' type`,
  },
  missing_property: {
    code: 1,
    note: ({ name }: WithName) => `Property '${name}' missing`,
  },
}

type Base = typeof base

type Name = keyof Base

export function halt(form: Name, link: Link<Base, Name>) {
  throw makeHalt({ base, form, host, link })
}

process.on('uncaughtException', err => {
  console.log(err.stack)
})

halt('invalid_type', { name: 'foo', type: 'bar' })
