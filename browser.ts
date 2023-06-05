import {
  Link,
  HaltMesh,
  haveHalt,
  saveHalt,
  testHalt,
} from '@tunebond/halt'
import makeHalt, { MakeHalt, makeText, TONE } from './index.js'

export { makeText, haveHalt, saveHalt, testHalt, TONE }

export type { Link, HaltMesh, MakeHalt }
export default makeHalt
