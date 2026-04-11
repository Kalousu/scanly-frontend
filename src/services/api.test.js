import test from 'node:test'
import assert from 'node:assert/strict'
import api, { API_BASE_URL, API_TIMEOUT_MS } from './api.js'

test('api uses release-safe defaults', () => {
  assert.equal(API_BASE_URL, '/api')
  assert.equal(API_TIMEOUT_MS, 10000)
  assert.equal(api.defaults.baseURL, '/api')
  assert.equal(api.defaults.timeout, 10000)
})

test('api sends json requests by default', () => {
  assert.equal(api.defaults.headers.common.Accept, 'application/json, text/plain, */*')
  assert.equal(api.defaults.headers['Content-Type'], 'application/json')
})
