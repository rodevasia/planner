import { Controller, Get, sendErrorResponse, sendSuccessResponse } from '@docsploit/espress'
import { authenticated } from '../../utils/auth'
import type { Response, Request } from 'express'
import ProjectLogs from './project_logs.model'
import Users from '../user/user.model'

/**
 * @name Project_logs
 * @desc Controller class for handling project logs
 */
@Controller('/logs')
export default class Project_logs {
  /**
   * @name getAll
   * @desc Retrieves all logs for a project
   * @auth session
   */
  @Get('/', { middleware: [authenticated] })
  async getAll(req: Request, res: Response) {
    try {
      const limit = parseInt(req.query.limit as string) || (10 as number)
      const projectId = req.query.projectId as string
      if (projectId) {
        const logs = await ProjectLogs.findAll({
          where: { projectId },
          limit,
          order: [['updatedAt', 'desc']],
          include: [{ model: Users, attributes: ['name'] }]
        })
        return sendSuccessResponse('success', logs, res)
      } else {
        return sendErrorResponse(400, 'Project not found', res)
      }
    } catch (error) {
      console.debug(error)
    }
  }
}

export enum LogType {
  normal = 'normal', // text
  link = 'link' // include link id
}
