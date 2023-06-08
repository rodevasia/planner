import { jsPDF } from 'jspdf'
import {applyPlugin} from 'jspdf-autotable'
import moment from 'moment'
import QrCode from 'qrcode'
import { User } from '../user/user.model'
import { ClientsType } from '../clients/clients.model'
import { documentsPath } from '../..'
import path from 'path'
applyPlugin(jsPDF)
interface Project {
  name: string
}

interface Item {
  description: string
  duration: number
  amount: number
  rate: number
}

export interface InvoiceData {
  invoiceNumber: string
  date: string
  client: ClientsType
  user: Omit<User, 'verified' | 'id' | 'password'>
  project: Project
  items: Item[]
  due: number
  accountDetails: string
}
export interface InvoiceAdditions {
  field: string
  value: string
  type: 'sub' | 'add'
}
// Create a new PDF document
export default async function generateInvoice(
  invoiceData: InvoiceData,
  additionalFields: InvoiceAdditions[] | undefined
) {
  try {
    const doc = new jsPDF()
    const pageWidth = doc.internal.pageSize.width || doc.internal.pageSize.getWidth()
    const x = 20
    let y = 0
    // Set up the invoice data

    // Add the invoice header
    y = y + 20
    doc.setFontSize(23).setTextColor('#666').text(invoiceData.project.name, x, y)
    y = y + 10
    doc.setFontSize(14).setTextColor('#666').text('Invoice', x, y)
    // Add the invoice number and date
    doc.setFontSize(23)
    const invTextLabel = `Invoice Number: `
    const invTextValue = `#${invoiceData.invoiceNumber}`
    const labelWidth = doc.getTextWidth(invTextLabel)
    /**
     * Invoice date and number
     */
    doc.setTextColor('black').setFontSize(9)
    doc.setFont('Helvetica', 'bold').text('Date:', pageWidth - (labelWidth + 15), y - 5) //Date: label
    doc.setFont('Helvetica', 'normal').text(invoiceData.date, pageWidth - (labelWidth + 6), y - 5) // Date value
    doc.setFont('Helvetica', 'bold').text('Invoice Number:', pageWidth - (labelWidth + 15), y) // Label
    doc.setFont('Helvetica', 'normal').text(invTextValue, pageWidth - (labelWidth - 12), y) //Value
    // Draw Line
    doc.setLineWidth(0.75)
    doc.setDrawColor('#ddd')
    doc.line(x, y + 5, pageWidth - 10, y + 5)

    y += 15
    // Add My Info
    doc.setFontSize(12)
    doc.setFont('Helvetica', 'bold')
    doc.text('From', x, y)
    doc.text('Bill To', pageWidth - 75, y)
    doc.setFont('Helvetica', 'normal')
    y += 8
    doc.text(invoiceData.user.name, x, y)
    doc.text(invoiceData.client.name, pageWidth - 75, y)
    const userAddress = invoiceData.user.address.split(',')
    const clientAddress = invoiceData.client.address.split(',')
    y += 5
    let tempUy = y
    let tempCy = y
    doc.setFontSize(10)
    userAddress.forEach((t) => {
      doc.text(t, x, tempUy)
      tempUy += 5
    })
    doc.text(
      `${invoiceData.user.city}, ${invoiceData.user.country} - ${invoiceData.user.pincode}`,
      x,
      tempUy
    )
    tempUy += 8
    doc.text(`Email - ${invoiceData.user.email}`, x, tempUy)
    tempUy += 5
    doc.text(`Phone - ${invoiceData.user.phone}`, x, tempUy)
    doc.text(invoiceData.client.company, pageWidth - 75, tempCy)
    tempCy += 5
    clientAddress.forEach((t) => {
      doc.text(t, pageWidth - 75, tempCy)
      tempCy += 5
    })

    doc.text(
      `${invoiceData.client.city}, ${invoiceData.client.country} - ${invoiceData.client.pincode}`,
      pageWidth - 75,
      tempCy
    )
    tempCy += 8
    doc.text(`Email - ${invoiceData.client.email}`, pageWidth - 75, tempCy)
    tempCy += 5
    doc.text(`Phone - ${invoiceData.client.phone}`, pageWidth - 75, tempCy)
    y = tempUy > tempCy ? tempUy : tempCy

    const tableData = {
      headers: ['Description', 'Duration', 'Rate/Hour', 'Amount'],
      rows: [] as any[]
    }
    let total = 0
    for (const item of invoiceData.items) {
      tableData.rows.push([
        item.description,
        moment
          .utc(moment.duration(item.duration, 'milliseconds').asMilliseconds())
          .format('HH : mm : ss'),
        item.rate,
        item.amount
      ])
      total += item.amount
    }
    tableData.rows.push(['', '', 'Total:', total.toFixed(2)])

    if (additionalFields !== undefined) {
      if (additionalFields.length > 0) {
        additionalFields.map(({ field, type, value }) => {
          if (type === 'sub') {
            total -= parseInt(value)
            tableData.rows.push(['', '', field, value])
          }
          if (type === 'add') {
            total += parseInt('value')
            tableData.rows.push(['', '', field, value])
          }
        })
        tableData.rows.push(['', '', 'Final Amount Due:', total.toFixed(2)])
      }
    }

    // Define the table layout
    y += 10

    // Draw the table using jspdf-autotable
    doc.setFontSize(12)
    // doc.text('Invoice Items', pageWidth / 2, startY - headerHeight - cellMargin, { align: 'center' });
    let lineWidth = 0;

    (doc as any).autoTable( {
      startY: y,

      head: [
        [
          { content: 'Description', colSpan: 0, styles: { halign: 'center' } },
          { content: 'Duration', colSpan: 0, styles: { halign: 'center' } },
          { content: 'Rate/Hour', colSpan: 0, styles: { halign: 'center', cellWidth: 0 } },
          { content: 'Amount', colSpan: 0, styles: { halign: 'right' } }
        ]
      ],
      body: tableData.rows,
      theme: 'plain',
      tableWidth: pageWidth - x * 2,
      styles: {
        cellPadding: 2,
        fontSize: 9,
        halign: 'center',
        valign: 'middle'
      },
      willDrawCell: (data) => {
        if (data.row.index === data.table.body.length - 1) {
          doc.setFont('Helvetica', 'bold')
        }
      },
      didDrawCell: (data) => {
        if (data.cell.text.includes('Amount')) lineWidth = data.cell.width
        if (data.cell.text.includes('Total:')) {
          lineWidth += data.cell.width
          data.doc.setDrawColor('black').setLineWidth(0.5)
          data.doc.line(data.cell.x, data.cell.y, data.cell.x + lineWidth, data.cell.y)
          data.doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + lineWidth,
            data.cell.y + data.cell.height
          )
        }
        if (data.cell.text.includes('Final Amount Due:')) {
          if (data.pageNumber > 1) {
            lineWidth += data.cell.width
          }
          data.doc.setDrawColor('black').setLineWidth(0.5)
          data.doc.line(data.cell.x, data.cell.y, data.cell.x + lineWidth, data.cell.y)
          data.doc.line(
            data.cell.x,
            data.cell.y + data.cell.height,
            data.cell.x + lineWidth,
            data.cell.y + data.cell.height
          )
        }
      },
      headStyles: {
        fontSize: 10,
        fontStyle: 'bold',
        textColor: 'black',
        halign: 'center',
        valign: 'middle'
        // fillColor: [237, 237, 237],
      },
      columnStyles: {
        0: { halign: 'center' },
        3: {
          halign: 'right'
        }
      }
    })
    y = Math.round((doc as any).lastAutoTable.finalY)
    y += 20

    if (y > 254) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(10)
    doc.text('Payment Terms:', x, y)
    doc.text('Account Details', pageWidth - 50, y)
    y += 5
    const qrImage = await QrCode.toDataURL(invoiceData.accountDetails)
    doc.addImage(qrImage, 'image/png', pageWidth - 50, y, 25, 25)
    doc.setFontSize(8)
    doc.text(`Payment is due within ${invoiceData.due} days`, x, y)
    doc.setFontSize(10)
    y += 30
    doc.text('Thank you for your business', pageWidth / 2, y, { align: 'center' })
    doc.save(path.join(documentsPath, 'Planner', 'Invoices', `${invoiceData.invoiceNumber}.pdf`))
    // Finalize the PDF document
    return doc.output('datauristring')
  } catch (error) {
    throw error
  }
}
