/**
 * Composable for shared order utility functions.
 */
export function useOrderUtils() {
  /**
   * Get the total item count of an order (sum of all item amounts).
   */
  function getItemCount(order) {
    if (Array.isArray(order.orderItems)) {
      return order.orderItems.reduce((sum, item) => sum + (item.amount || 1), 0)
    }
    return 0
  }

  return { getItemCount }
}