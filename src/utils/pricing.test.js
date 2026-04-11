import test from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateCouponAdjustedTotal,
  calculateGrossLineTotal,
  calculateGrossUnitPrice,
  calculateNetLineTotal,
} from './pricing.js'

function assertAlmostEqual(actual, expected) {
  assert.equal(Number(actual.toFixed(4)), expected)
}

test('calculateGrossUnitPrice follows backend net plus tax calculation', () => {
  assertAlmostEqual(calculateGrossUnitPrice(2.49, 0.07), 2.6643)
})

test('calculateGrossLineTotal prefers backend gross total when available', () => {
  assert.equal(
    calculateGrossLineTotal({
      unitPriceNet: 2.49,
      amount: 2,
      taxRate: 0.07,
      totalPriceGross: 5.33,
    }),
    5.33,
  )
})

test('calculateGrossLineTotal falls back to net amount plus tax', () => {
  assertAlmostEqual(calculateGrossLineTotal({ unitPriceNet: 2.49, amount: 2, taxRate: 0.07 }), 5.3286)
})

test('calculateGrossLineTotal supports legacy cart quantities and weighted metadata', () => {
  assertAlmostEqual(calculateGrossLineTotal({ price: 3, qty: 2, taxRate: 0.19 }), 7.14)
  assertAlmostEqual(calculateGrossLineTotal({ price: 4, unit: 'kg', meta: { kg: 0.5 }, taxRate: 0.07 }), 2.14)
})

test('calculateNetLineTotal supports legacy cart quantities', () => {
  assert.equal(calculateNetLineTotal({ price: 3, qty: 2, taxRate: 0.19 }), 6)
})

test('calculateCouponAdjustedTotal prefers backend total after discount', () => {
  assert.equal(calculateCouponAdjustedTotal(10, { discount: 2, totalAfterDiscount: 7.49 }), 7.49)
})

test('calculateCouponAdjustedTotal falls back to local discount subtraction', () => {
  assert.equal(calculateCouponAdjustedTotal(10, { discount: 2 }), 8)
})
