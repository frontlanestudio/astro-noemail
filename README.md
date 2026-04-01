# astro-noemail

**Build-time email address obfuscation for Astro**

`astro-noemail` is a tiny, static-first Astro integration that protects email addresses from basic scrapers by converting them into HTML entities **at build time**.

There is:
- no JavaScript at runtime
- no hydration
- no DOM mutation in the browser
- no adapter dependency

Just safer HTML.

---

## Why this exists

Email addresses published in plain HTML are routinely harvested by simple bots.

Most solutions rely on:
- JavaScript obfuscation
- runtime DOM rewriting
- client-side decoding

These approaches:
- increase page weight
- break with JS disabled
- add unnecessary complexity

`astro-noemail` solves this once, **during the build**, and produces static, cache-safe output.

---

## What it does

On `astro build`, the plugin:

- scans generated `.html` files in the output directory
- finds plain-text email addresses
- replaces them with numeric HTML entities

Example:

```html
info@velohost.co.uk
```

becomes:

```html
&#105;&#110;&#102;&#111;&#64;&#118;&#101;&#108;&#111;&#104;&#111;&#115;&#116;&#46;&#99;&#111;&#46;&#117;&#107;
```

Browsers render this normally, but basic scrapers do not.

---

## What it does NOT do

This plugin deliberately does **not**:

- run at runtime
- inject JavaScript
- parse the DOM
- modify Astro source files
- touch files outside the build output
- expose environment variables
- interfere with adapters or rendering

It operates **only** on final HTML output.

---

## Safety guarantees

The obfuscation logic is hardened to:

- skip `<script>`, `<style>`, and `<noscript>` blocks
- avoid double-encoding existing HTML entities
- only mutate files when a change is required
- never crash or fail a build

Astro-specific HTML rewriting is respected.

---

## Installation

```bash
npm install astro-noemail
```

---

## Usage

Add the integration to your Astro config:

```js
import { defineConfig } from "astro/config";
import astroNoEmail from "astro-noemail";

export default defineConfig({
  integrations: [
    astroNoEmail()
  ]
});
```

That’s it.

No configuration is required.

---

## Optional configuration

### Disable the plugin

```js
astroNoEmail({
  enabled: false
})
```

This can be useful for local testing or special builds.

---

## Mailto links

Email addresses inside visible text **and** `mailto:` links are obfuscated.

The links continue to function normally in browsers.

---

## `<noscript>` behaviour

Astro may rewrite `<noscript>` content during compilation.

If an email address is moved outside of a `<noscript>` block by Astro itself, it will be treated as normal HTML text and obfuscated.

This behaviour is intentional and considered safe.

---

## CDN & caching

Because all changes are static:

- output can be cached aggressively
- the plugin works behind any CDN
- Cloudflare, Netlify, Vercel, S3, and similar platforms are fully supported

---

## Failure behaviour

If a file cannot be processed:

- the error is logged
- the build continues
- the site is not broken

The plugin must never block a deployment.

---

## License

MIT License

Copyright (c) 2026 Velohost UK Limited

---

## Author

Built and maintained by **Velohost**

Website: https://velohost.co.uk/

Project page:
https://velohost.co.uk/plugins/astro-noemail/
