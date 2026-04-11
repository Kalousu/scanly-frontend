import test from 'node:test'
import assert from 'node:assert/strict'
import { useErrorToast } from './useErrorToast.js'

test('useErrorToast shows and clears an error message', () => {
  const { errorMessage, showError, clearError } = useErrorToast()

  showError('Backend nicht erreichbar')
  assert.equal(errorMessage.value, 'Backend nicht erreichbar')

  clearError()
  assert.equal(errorMessage.value, '')
})

test('useErrorToast replaces an existing message', () => {
  const { errorMessage, showError } = useErrorToast()

  showError('Erster Fehler')
  showError('Zweiter Fehler')

  assert.equal(errorMessage.value, 'Zweiter Fehler')
})
