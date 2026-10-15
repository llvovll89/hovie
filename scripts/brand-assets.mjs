import { writeFileSync, mkdirSync } from 'node:fs'

// Original HOVIE geometry. The diagonal edit separates two interlocking frames.
const mark = '<path d="M2 2h8v14h15l-6 8h-9v14H2Z M30 2h8v36h-8V24h-7l6-8h1Z"/>'
const type = '<path d="M0 0h6v11h13V0h6v28h-6V17H6v11H0Z M76 0h7l9 21L101 0h7L96 28h-8Z M117 0h6v28h-6Z M135 0h25v6h-19v5h16v6h-16v5h19v6h-25Z"/><path fill-rule="evenodd" d="M48 0h8c9 0 14 5 14 14s-5 14-14 14h-8c-9 0-14-5-14-14S39 0 48 0Zm0 6c-5 0-8 2-8 8s3 8 8 8h8c5 0 8-2 8-8s-3-8-8-8Z"/>'
const svg = (body, viewBox, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ${extra}>${body}</svg>\n`
const lockup = (ink, accent) => `<g fill="${accent}">${mark}</g><g transform="translate(56 6)" fill="${ink}">${type}</g>`
mkdirSync('public/brand', { recursive: true })
writeFileSync('public/brand/hovie.svg', svg(lockup('#17212c', '#006bb8'), '0 0 216 40', 'role="img" aria-label="HOVIE"'))
writeFileSync('public/brand/hovie-dark.svg', svg(lockup('#f3f6f9', '#5cb8f5'), '0 0 216 40', 'role="img" aria-label="HOVIE"'))
writeFileSync('public/brand/hovie-mono.svg', svg(lockup('currentColor', 'currentColor'), '0 0 216 40', 'role="img" aria-label="HOVIE"'))
writeFileSync('public/brand/hovie-mark.svg', svg(`<g fill="#006bb8">${mark}</g>`, '0 0 40 40', 'role="img" aria-label="HOVIE"'))
writeFileSync('public/brand/hovie-app.svg', svg(`<path fill="#101419" d="M0 0h512v512H0Z"/><g transform="translate(128 128) scale(6.4)" fill="#5cb8f5">${mark}</g>`, '0 0 512 512'))
writeFileSync('public/favicon.svg', svg(`<style>path{fill:#006bb8}@media(prefers-color-scheme:dark){path{fill:#5cb8f5}}</style>${mark}`, '0 0 40 40'))
