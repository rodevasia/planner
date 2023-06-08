import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  sendErrorResponse,
  sendSuccessResponse
} from '@docsploit/espress'
import type { Request, Response } from 'express'
import { authenticated } from '../../utils/auth'
import ClientModel, { clientSchema } from './clients.model'

/**
 * @name Clients
 *
 */
@Controller('/clients')
export default class Clients {
  /**
   * @name Add Client
   * @param req
   * @param res
   * @returns
   */
  @Post('/', { middleware: [authenticated], schema: clientSchema })
  async add(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id
      const body = req.body
      body.userId = userId
      const client = await ClientModel.create(body)
      return sendSuccessResponse('success', { client: client.id }, res)
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name All Clients
   * @param req
   * @param res
   * @returns
   */
  @Get('/', { middleware: [authenticated], schema: { ...clientSchema, required: [] } })
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id

      const clients = await ClientModel.findAll({ where: { userId, ...req.query } })
      return sendSuccessResponse('success', clients, res)
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Single Client
   * @param req
   * @param res
   * @returns
   */
  @Get('/:clientId', { middleware: [authenticated] })
  async get(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id
      const clientId = req.params.clientId
      const client = await ClientModel.findOne({ where: { id: clientId, userId } })
      if (!client) {
        return sendErrorResponse(404, 'Client not found', res)
      }
      return sendSuccessResponse('success', client, res)
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Update Client
   * @param req
   * @param res
   * @returns
   */
  @Put('/:clientId', { middleware: [authenticated], schema: { ...clientSchema, required: [] } })
  async put(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id
      const clientId = req.params.clientId
      const client = await ClientModel.findOne({ where: { id: clientId, userId } })
      if (!client) {
        return sendErrorResponse(400, 'Client not found', res)
      }
      const body = req.body
      await client.update(body)
      return sendSuccessResponse('success', client, res)
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Delete Client
   * @param req
   * @param res
   * @returns
   */
  @Delete('/:clientId', { middleware: [authenticated] })
  async delete(req: Request, res: Response) {
    try {
      const userId = (req.user as any)?.id
      const clientId = req.params.clientId
      const client = await ClientModel.findOne({ where: { id: clientId, userId } })
      if (!client) {
        return sendErrorResponse(404, 'Client not found', res)
      }
      await client.destroy()
      return sendSuccessResponse('success', null, res)
    } catch (error) {
      console.log(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
}
