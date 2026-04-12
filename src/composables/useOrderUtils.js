export function useOrderUtils() {
  function getItemCount(order) {
    if (Array.isArray(order.orderItems)) {
      return order.orderItems.reduce((sum, item) => sum + (item.amount || 1), 0)
    }
    return 0
  }

  return { getItemCount }
}
