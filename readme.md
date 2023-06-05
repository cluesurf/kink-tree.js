<br/>
<br/>
<br/>
<br/>
<br/>
<br/>
<br/>

<h3 align='center'>@tunebond/halt-text</h3>
<p align='center'>
  Error printing in TypeScript
</p>

<br/>
<br/>
<br/>

## Installation

```
pnpm add @tunebond/halt-text
yarn add @tunebond/halt-text
npm i @tunebond/halt-text
```

## Usage

```ts
import makeHalt from '@tunebond/halt-text'

export function halt(form: Name, link: Link<Base, Name>) {
  throw makeHalt({ base, form, host, link })
}

process.on('uncaughtException', err => {
  console.log(err.stack)
})

halt('invalid_type', { name: 'foo', type: 'bar' })
```

<p align='center'>
  <img src='https://github.com/tunebond/halt-text.js/blob/make/halt.png?raw=true' width='640'/>
</p>

## License

MIT

## TuneBond

This is being developed by the folks at [TuneBond](https://tune.bond), a
California-based project for helping humanity master information and
computation. TuneBond started off in the winter of 2008 as a spark of an
idea, to forming a company 10 years later in the winter of 2018, to a
seed of a project just beginning its development phases. It is entirely
bootstrapped by working full time and running
[Etsy](https://etsy.com/shop/tunebond) and
[Amazon](https://www.amazon.com/s?rh=p_27%3AMount+Build) shops. Also
find us on [Facebook](https://www.facebook.com/tunebond),
[Twitter](https://twitter.com/tunebond), and
[LinkedIn](https://www.linkedin.com/company/tunebond). Check out our
other GitHub projects as well!
