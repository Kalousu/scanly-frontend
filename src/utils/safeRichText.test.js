import test from 'node:test'
import assert from 'node:assert/strict'
import { toSafeRichTextSegments } from './safeRichText.js'

test('toSafeRichTextSegments keeps plain text untouched', () => {
  assert.deepEqual(toSafeRichTextSegments('Einfach scannen'), [
    { text: 'Einfach scannen', strong: false },
  ])
})

test('toSafeRichTextSegments converts trusted bold tags into segments', () => {
  assert.deepEqual(toSafeRichTextSegments('Produkt <strong>Apfel</strong> entfernen?'), [
    { text: 'Produkt ', strong: false },
    { text: 'Apfel', strong: true },
    { text: ' entfernen?', strong: false },
  ])
})

test('toSafeRichTextSegments treats unsupported markup as text', () => {
  assert.deepEqual(toSafeRichTextSegments('<script>alert(1)</script>'), [
    { text: '<script>alert(1)</script>', strong: false },
  ])
})
