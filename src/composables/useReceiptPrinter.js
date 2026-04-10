import { fetchReceiptForOrder } from '@/services/api'
import { PrinterEncoder } from '@/PrinterEncoder'

export function useReceiptPrinter(showError) {
  async function printReceipt(orderId) {
    if (!orderId) {
      showError('Keine Order vorhanden')
      return false
    }

    let device = null
    try {
      const receiptData = await fetchReceiptForOrder(orderId)
      device = await navigator.usb.requestDevice({
        filters: [{ vendorId: 0x0483, productId: 0x5840 }],
      })
      await device.open()
      await device.selectConfiguration(1)
      await device.claimInterface(0)

      const endpoint = device.configuration.interfaces[0].alternate.endpoints.find(
        (e) => e.direction === 'out',
      )
      if (!endpoint) {
        throw new Error('Kein Drucker-Endpunkt gefunden.')
      }

      const printer = new PrinterEncoder()
      printer
        .init()
        .setCodepage()
        .setGerman()
        .center()
        .setBold()
        .setItalic()
        .setUnderline()
        .println(0xC3)
        .beep()
        .unsetUnderline()
        .unsetBold()

      if (receiptData.receiptItemResponseList?.length > 0) {
        printer.printEURLabel()
        receiptData.receiptItemResponseList.forEach((item) => {
          printer.printPrice(
            item.productName,
            item.totalPriceGross,
            item.unitPriceGross,
            item.amount,
            item.taxLabel,
          )
        })
        printer.lineSeparator()
        printer.setBold()
        printer.printSum(receiptData.totalAmount)
        printer.unsetBold()
        printer.feed(1)
        printer.printTaxGroupTable(receiptData.receiptTaxGroupResponseList)
      }

      printer.unsetItalic()
      printer.feed(1)
      printer.cut()

      await device.transferOut(endpoint.endpointNumber, printer.encode())
      return true
    } catch (error) {
      const errorMsg = error?.message || 'Bon konnte nicht gedruckt werden.'
      showError(`Bon-Druck fehlgeschlagen: ${errorMsg}`)
      return false
    } finally {
      if (device?.opened) {
        await device.close()
      }
    }
  }

  return { printReceipt }
}
