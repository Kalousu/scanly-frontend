<template>
  <aside class="panel cart-panel">
    <div v-if="items.length === 0" class="empty-state">
      <h2 class="empty-title">{{ t('emptyTitle') }}</h2>
      <p class="empty-hint">{{ t('emptyHint') }}</p>
    </div>

    <div v-else class="cart">
      <div class="cart-header">
        <h2 class="cart-title">{{ t('cartTitle') }}</h2>
        <span v-if="showScanBadge" class="scan-badge">
          <span class="scan-badge-dot"></span>
          {{ t('scanActive') }}
        </span>
      </div>

      <div class="cart-items">
        <div v-for="item in items" :key="item.id" class="cart-item">
          <div class="ci-accent"></div>
          <div class="ci-left">
            <div class="ci-name">{{ item.productName }}</div>
            <div class="ci-meta">
              <span>{{ formatPrice(item.unitPriceNet) }} netto · MwSt {{ Math.round(item.taxRate * 100) }}%</span>
            </div>
          </div>

          <div class="ci-right">
            <div class="ci-price">{{ formatPrice(item.totalPriceGross) }}</div>

            <div class="ci-qty" :aria-label="editable ? undefined : 'Menge'">
              <template v-if="editable && !isFruitsVegetables(item)">
                <button type="button" class="qty-btn" @click="$emit('update-quantity', item, -1)">−</button>
              </template>
              <span class="qty-val">
                <template v-if="editable">
                  {{ isFruitsVegetables(item) ? item.amount.toFixed(2) + ' kg' : item.amount }}
                </template>
                <template v-else>
                  {{ item.amount }}×
                </template>
              </span>
              <template v-if="editable && !isFruitsVegetables(item)">
                <button type="button" class="qty-btn" @click="$emit('update-quantity', item, 1)">+</button>
              </template>
            </div>

            <button
              v-if="editable"
              type="button"
              class="delete-btn"
              title="Artikel entfernen"
              @click="$emit('delete-item', item)"
            >
            </button>
          </div>
        </div>
      </div>

      <div class="totals">
        <div v-if="appliedCoupon" class="totals-row totals-row--coupon">
          <span>Coupon ({{ appliedCoupon.code }})</span>
          <span class="totals-discount-value">-{{ formatPrice(couponDiscount) }}</span>
        </div>

        <div class="totals-row totals-total">
          <span>{{ t('total') }}</span>
          <span class="totals-total-value">{{ formatPrice(totalPrice) }}</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { useLanguage } from '@/components/Uselanguage'
import { useFormatters } from '@/composables/useFormatters'

defineProps({
  items: { type: Array, required: true },
  totalPrice: { type: Number, default: 0 },
  couponDiscount: { type: Number, default: 0 },
  appliedCoupon: { type: Object, default: null },
  editable: { type: Boolean, default: false },
  showScanBadge: { type: Boolean, default: false },
})

defineEmits(['update-quantity', 'delete-item'])

const { t } = useLanguage()
const { formatPrice } = useFormatters()

function isFruitsVegetables(item) {
  const cat = item.productCategory || item.category
  if (cat) return cat === 'FRUITS_VEGETABLES'
  return !Number.isInteger(item.amount)
}
</script>

<style scoped>
.panel {
  background: rgba(11, 32, 49, 0.88);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 28px;
  backdrop-filter: blur(16px);
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.5),
    inset 0 1px 0 rgba(255, 255, 255, 0.07);
  outline: 1px solid rgba(255, 255, 255, 0.04);
  outline-offset: -1px;
}

.cart-panel {
  background:
    radial-gradient(1200px 600px at 30% 20%, rgba(24, 231, 242, 0.06), transparent 60%),
    rgba(11, 32, 49, 0.88);
  width: 30%;
  min-width: 280px;
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  padding: 36px 32px;
  box-sizing: border-box;
}

.cart-panel,
.cart,
.cart-items {
  overflow-x: hidden;
}

.empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(255, 255, 255, 0.65);
  gap: 12px;
}

.empty-title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.96);
  letter-spacing: -0.01em;
}

.empty-hint {
  margin: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.42);
  line-height: 1.55;
  max-width: 220px;
}

.cart {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.cart-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
}

.cart-title {
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.scan-badge {
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 11px;
  font-weight: 700;
  color: #18e7f2;
  background: rgba(24, 231, 242, 0.09);
  border: 1px solid rgba(24, 231, 242, 0.28);
  padding: 5px 12px;
  border-radius: 999px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.scan-badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #18e7f2;
  box-shadow: 0 0 6px #18e7f2;
  flex-shrink: 0;
  animation: pulse-dot 1.8s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.45; transform: scale(0.65); }
}

.cart-items {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-height: 0;
  scrollbar-width: thin;
  scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

.cart-items::-webkit-scrollbar { height: 0px; }

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 14px;
  background: rgba(0, 0, 0, 0.14);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.12);
  min-width: 0;
  border-radius: 16px;
  transition: border-color 0.2s, background 0.2s, transform 0.18s, box-shadow 0.2s;
  position: relative;
  overflow: hidden;
}

.ci-accent {
  position: absolute;
  left: 0; top: 0; bottom: 0;
  width: 3px;
  background: linear-gradient(180deg, #18e7f2, #1bc7ff);
  border-radius: 16px 0 0 16px;
  opacity: 0;
  transform: scaleY(0.4);
  transition: opacity 0.2s, transform 0.2s;
}

.cart-item:hover .ci-accent { opacity: 0.7; transform: scaleY(1); }

.ci-left { flex: 1; min-width: 0; }

.ci-name, .ci-meta {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ci-name {
  font-size: 13.5px;
  font-weight: 650;
  color: rgba(255, 255, 255, 0.96);
  line-height: 1.3;
  letter-spacing: -0.01em;
}

.ci-meta {
  font-size: 11px;
  color: rgba(255, 255, 255, 0.42);
  margin-top: 3px;
  line-height: 1.2;
}

.ci-right {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-left: 10px;
  flex-shrink: 0;
  max-width: 50%;
}

.ci-price {
  font-size: 14px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.96);
  min-width: 52px;
  text-align: right;
  letter-spacing: -0.01em;
}

.ci-qty {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 10px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.17);
  border-radius: 10px;
}

.qty-btn {
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.65);
  padding: 0;
  width: 18px; height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  border-radius: 5px;
  transition: color 0.13s, background 0.13s;
}

.qty-btn:hover {
  color: #18e7f2;
  background: rgba(24, 231, 242, 0.12);
}

.qty-val {
  min-width: 18px;
  text-align: center;
  font-size: 13px;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.96);
}

.delete-btn {
  border: none;
  background: rgba(248, 113, 113, 0.08);
  cursor: pointer;
  color: rgba(255, 255, 255, 0.42);
  width: 30px; height: 30px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(248, 113, 113, 0.15);
  transition: background 0.15s, color 0.15s, border-color 0.15s, transform 0.13s;
}

.delete-btn:hover {
  background: rgba(248, 113, 113, 0.18);
  color: #fca5a5;
  border-color: rgba(248, 113, 113, 0.35);
  transform: scale(1.08);
}

.delete-btn:active { transform: scale(0.95); }

.totals {
  margin-top: 16px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.totals-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.65);
  padding: 3px 0;
  line-height: 1.5;
}

.totals-row--coupon {
  color: #6ef0b4;
  font-weight: 700;
}

.totals-discount-value {
  color: #6ef0b4;
}

.totals-total {
  font-size: 20px;
  font-weight: 900;
  color: #18e7f2;
  text-shadow: 0 0 18px rgba(24, 231, 242, 0.25);
  margin-top: 8px;
  padding-top: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  letter-spacing: -0.03em;
}

.totals-total-value {
  color: #18e7f2;
  text-shadow: 0 0 20px rgba(24, 231, 242, 0.5);
}
</style>
