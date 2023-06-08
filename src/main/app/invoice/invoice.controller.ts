import { Controller, Get, Post, sendErrorResponse, sendSuccessResponse } from '@docsploit/espress'
import type { Request, Response } from 'express'
import generateInvoice, { InvoiceData } from './invoicePdf'
import Clients from '../clients/clients.model'
import { authenticated } from '../../utils/auth'
import Users from '../user/user.model'
import moment from 'moment'
import Projects from '../projects/projects.model'
import { InvoiceModel, getInvoiceSchema, invoicePostSchema } from './invoice.model'
import Tasks from '../tasks/tasks.model'
import { PassThrough } from 'stream'
import { supabase } from '../../utils/uploader'
/**
 * @name Clients
 */
@Controller('/invoice')
export default class Invoice {
  /**
   * @name Generate Invoice
   */
  @Post('/generate', { middleware: [authenticated], schema: invoicePostSchema })
  async generate(req: Request, res: Response) {
    try {
      const body = req.body
      const userId = (req.user as any)?.id
      const user = await Users.findByPk(userId, {
        attributes: { exclude: ['password', 'createdAt', 'updatedAt'] }
      })
      if (!user) return sendErrorResponse(404, 'User Not Found', res)
      const client = await Clients.findByPk(body.clientId, {
        attributes: { exclude: ['createdAt', 'updatedAt', 'id'] }
      })
      if (!client) return sendErrorResponse(404, 'Client Not Found', res)
      const project = await Projects.findByPk(body.projectId, { attributes: ['name', 'code'] })
      if (!project) return sendErrorResponse(404, 'Project Not Found', res)
      const invoiceData: InvoiceData = {
        accountDetails: body.accountDetails,
        client,
        user,
        date: moment().format('DD MMM YYYY'),
        due: body.due,
        invoiceNumber: `${project.code}${moment().format('DDMMYYYYHHmm')}`,
        items: [],
        project
      }
      body.invoiceItems.map((t) => {
        const { description, duration, rate } = t
        const amount = parseFloat((moment.duration(duration).asHours() * rate).toFixed(2))
        invoiceData.items.push({ amount, description, duration, rate })
      })

      const pdfUri = await generateInvoice(invoiceData, req.body.additionalFields)
      const bufferStream = new PassThrough()
      bufferStream.end(Buffer.from(pdfUri.split(',')[1], 'base64'))
      const { error } = await supabase.storage
        .from('invoices')
        .upload(`${invoiceData.invoiceNumber}.pdf`, bufferStream, {
          contentType: 'application/pdf'
        })
      if (error) {
        throw error
      }

      const inv = await InvoiceModel.create({
        name: invoiceData.invoiceNumber,
        clientId: body.clientId,
        projectId: body.projectId,
        userId
      })
      body.invoiceItems.forEach(async (item) => {
        await Tasks.update({ billed: true }, { where: { id: item.tasks } })
      })
      return sendSuccessResponse('success', { name: inv.name }, res)
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
    // Invoices.
  }
  /**
   * @name Fetch All Invoices
   * @param req
   * @param res
   */
  @Get('/', { middleware: [authenticated], schema: getInvoiceSchema })
  async invoices(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id
      const invoices = await InvoiceModel.findAll({
        where: { ...req.query, userId },
        attributes: ['name', 'createdAt']
      })
      sendSuccessResponse('success', invoices, res)
    } catch (error) {
      console.log(error)
      throw error
    }
  }
}
