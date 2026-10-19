# slidev-theme-as

[![NPM version](https://img.shields.io/npm/v/slidev-theme-as?color=3AB9D4&label=)](https://www.npmjs.com/package/slidev-theme-as)

A (...) theme for [Slidev](https://github.com/slidevjs/slidev).

<!--
  Learn more about how to write a theme:
  https://sli.dev/guide/write-theme.html
--->

<!--
  run `npm run dev` to check out the slides for more details of how to start writing a theme
-->

<!--
  Put some screenshots here to demonstrate your theme

  Live demo: [...]
-->

## Install

Add the following frontmatter to your `slides.md`. Start Slidev then it will prompt you to install the theme automatically.

<pre><code>---
theme: <b>as</b>
---</code></pre>

Learn more about [how to use a theme](https://sli.dev/guide/theme-addon#use-theme).

## Layouts

| Layout | Frontmatter | Notes |
| --- | --- | --- |
| `cover` | `eyebrow`, `event` | Animated grey-band background, always dark. `# Title` + first paragraph as subtitle. No footer. |
| `intro` | `section` (e.g. `'02'`), `eyebrow` | Section divider with the outlined ghost number. Always dark. |
| `default` | `center` | Top-aligned content. |
| `two-cols` | `title`, `cols` (e.g. `1fr 1.15fr`), `valign` | Use `::right::` for the second column. |
| `blackboard` | `eyebrow`, `title`, `meta` | Full-bleed scene, caption in label boxes. |
| `full-video` | `video`, `poster`, `muted`, `loop`, `eyebrow`, `title`, `meta` | Full-bleed video background, caption in label boxes. Plays from the start on slide enter. |
| `presenter` | `image` | Content left, image right. |

Every slide except `cover` gets the footer (logo, handle, `NN / NN`). Set `footer: false` to hide it.

`cover` and `intro` render their background, grain included, with a small [TypeGPU](https://docs.swmansion.com/TypeGPU/) fragment shader (`components/ShaderBg.vue`, `utils/shader-bg.ts`), so they set `--as-grain: 0` to skip the CSS grain overlay. When WebGPU is unavailable (older browsers, headless export) the static `styles/bg.png` stays visible instead. Add `bgControls: true` to a cover or intro slide's frontmatter to get a [TresLeches](https://www.npmjs.com/package/@tresjs/leches) panel with every shader parameter (motion, both noise octaves, tone mapping, grain). "Copy as JSON" puts the current values on the clipboard; paste them over `SHADER_BG_DEFAULTS` in `utils/shader-bg-settings.ts` to make them the new defaults. The `'use gpu'` shader body is compiled by `unplugin-typegpu`, registered in the theme's `vite.config.ts`, which Slidev merges into every deck that uses the theme.

## Utilities

- `.eyebrow`, `.meta`, `.lead` for small text
- `.card` for images and scenes (same border and radius as code blocks), `.card-label` and `.card-label.top-right` for overlays
- ` ```ts [file.ts] ` renders the file name above the code block

## Components

- `<Logo :size="34" />`

## Contributing

- `npm install`
- `npm run dev` to start theme preview of `example.md`
- Edit the `example.md` and style to see the changes
- `npm run export` to generate the preview PDF
- `npm run screenshot` to generate the preview PNG
