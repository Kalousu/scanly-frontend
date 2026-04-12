import { ref } from 'vue'
import { useLanguage } from '@/components/Uselanguage'
import { PrinterEncoder } from '@/PrinterEncoder'
import { fetchReceiptForOrder } from '@/services/api'

const receiptPrinterFilters = [{ vendorId: 0x0483, productId: 0x5840 }]

function getReceiptPrinterErrorMessage(error, t) {
  if (error?.name === 'NotFoundError') {
    return t('receiptPrinterNotFound')
  }
  if (error?.name === 'NotAllowedError' || error?.name === 'SecurityError') {
    return t('receiptPrinterAccessDenied')
  }
  if (error?.name === 'NetworkError') {
    return t('receiptPrinterTransferFailed')
  }
  return error?.message || t('receiptPrinterGenericError')
}

export function useReceiptPrinter(showError) {
  const { t, tFn } = useLanguage()
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
      showError(t('receiptPrinterUnsupported'))
      return false
    }

    try {
      printerDevice.value = await getKnownPrinterDevice()
      return Boolean(printerDevice.value)
    } catch (error) {
      printStatus.value = 'error'
      showError(tFn('receiptPrinterReconnectFailed', getReceiptPrinterErrorMessage(error, t)))
      return false
    }
  }

  async function printReceipt(orderId) {
    if (!orderId) {
      printStatus.value = 'error'
      showError(t('orderMissing'))
      return false
    }

    let device = null
    try {
      if (!navigator.usb) {
        printStatus.value = 'unsupported'
        showError(t('receiptPrinterUnsupported'))
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
        throw new Error(t('receiptEndpointMissing'))
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
        .beep()
        .unsetUnderline()
        .unsetBold()
        .printScanlyInfo()
        .feed(1)
        .lineSeparator()

      if (receiptData.receiptItemResponseList?.length > 0) {
        printer.printCurrencyLabel(t('receiptCurrencyLabel'))
        receiptData.receiptItemResponseList.forEach((item) => {
          printer.printPrice(
            item.productName,
            item.totalPriceGross,
            item.unitPriceGross,
            item.amount,
            item.taxLabel,
          )
        })
        printer.printSum(receiptData.totalAmount, t('receiptTotalLabel'))
        printer.lineSeparator()
        printer.printTaxGroupTable(receiptData.receiptTaxGroupResponseList, t('receiptTaxHeader'))
      }

      printer
        .setBold()
        .unsetBold()
        .unsetItalic()
        .feed(1)
        .println('Vielen Dank für den Einkauf!')
        .println('Kommen Sie gerne')
        .println('irgendwann wieder :)')
        .feed(3)
        .cut()

      printStatus.value = 'printing'
      await device.transferOut(endpoint.endpointNumber, printer.encode())
      printStatus.value = 'done'
      return true
    } catch (error) {
      printStatus.value = 'error'
      showError(tFn('receiptPrintFailed', getReceiptPrinterErrorMessage(error, t)))
      return false
    } finally {
      if (device?.opened) {
        try {
          await device.close()
        } catch {
          void 0
        }
      }
    }
  }

  return { printReceipt, printStatus, reconnectPrinter }
}
