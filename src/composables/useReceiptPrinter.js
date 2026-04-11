import { ref } from 'vue'
import { fetchReceiptForOrder } from '@/services/api'
import { PrinterEncoder } from '@/PrinterEncoder'

const receiptPrinterFilters = [{ vendorId: 0x0483, productId: 0x5840 }]

function getReceiptPrinterErrorMessage(error) {
  if (error?.name === 'NotFoundError') {
    return 'Kein Drucker ausgewählt oder gefunden.'
  }
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
    return 'Zugriff auf den Drucker wurde verweigert.'
  }
  if (error?.name === 'NetworkError') {
    return 'USB-Übertragung zum Drucker fehlgeschlagen.'
  }
  return error?.message || 'Bon konnte nicht gedruckt werden.'
}

export function useReceiptPrinter(showError) {
  const printStatus = ref('idle')
  const printerDevice = ref(null)

  function isReceiptPrinter(device) {
    return receiptPrinterFilters.some(
      (filter) => device.vendorId === filter.vendorId && device.productId === filter.productId,
    )
  }

  async function getKnownPrinterDevice() {
    if (!navigator.usb?.getDevices) return null
    const devices = await navigator.usb.getDevices()
    return devices.find(isReceiptPrinter) || null
  }

  async function selectPrinterDevice() {
    const knownDevice = printerDevice.value || (await getKnownPrinterDevice())
    if (knownDevice) return knownDevice

    printStatus.value = 'selecting'
    return navigator.usb.requestDevice({
      filters: receiptPrinterFilters,
    })
  }

  async function reconnectPrinter() {
    if (!navigator.usb) {
      printStatus.value = 'unsupported'
      showError('Bon-Druck wird in diesem Browser nicht unterstützt. Bitte Chrome oder Edge verwenden.')
      return false
    }

    try {
      printerDevice.value = await getKnownPrinterDevice()
      return Boolean(printerDevice.value)
    } catch (error) {
      printStatus.value = 'error'
      showError(`Bon-Drucker konnte nicht verbunden werden: ${getReceiptPrinterErrorMessage(error)}`)
      return false
    }
  }

  async function printReceipt(orderId) {
    if (!orderId) {
      printStatus.value = 'error'
      showError('Keine Order vorhanden')
      return false
    }

    let device = null
    try {
      if (!navigator.usb) {
        printStatus.value = 'unsupported'
        showError('Bon-Druck wird in diesem Browser nicht unterstützt. Bitte Chrome oder Edge verwenden.')
        return false
      }

      printStatus.value = 'fetching'
      const receiptData = await fetchReceiptForOrder(orderId)
      device = await selectPrinterDevice()
      printerDevice.value = device

      printStatus.value = 'connecting'
      await device.open()
      if (device.configuration === null) {
        await device.selectConfiguration(1)
      }
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

      printStatus.value = 'printing'
      await device.transferOut(endpoint.endpointNumber, printer.encode())
      printStatus.value = 'done'
      return true
    } catch (error) {
      printStatus.value = 'error'
      showError(`Bon-Druck fehlgeschlagen: ${getReceiptPrinterErrorMessage(error)}`)
      return false
    } finally {
      if (device?.opened) {
        try {
          await device.close()
        } catch {
          // Closing a WebUSB device can fail after disconnects; the print result was already handled.
        }
      }
    }
  }

  return { printReceipt, printStatus, reconnectPrinter }
}
