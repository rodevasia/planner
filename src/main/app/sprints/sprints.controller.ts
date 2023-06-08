import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  ValidationSchema,
  sendErrorResponse,
  sendSuccessResponse
} from '@docsploit/espress'
import { authenticated } from '../../utils/auth'
import type { Response, Request } from 'express'
import validate from '@docsploit/espress/lib/schemaValidator'
import Projects from '../projects/projects.model'
import SprintsModel, { Sprint, SprintStatus } from './sprints.model'
import ProjectLogs from '../project_logs/project_logs.model'

/**
 * @name Sprints
 */
@Controller('/sprints')
export default class Sprints {
  /**
   * @name All Sprints
   * @param req
   * @param res
   * @returns
   */
  @Get('/', { middleware: [authenticated] })
  async getAll(req: Request, res: Response) {
    try {
      const schema: ValidationSchema<{ projectId: string }> = {
        type: 'object',
        properties: {
          projectId: { type: 'string' }
        },
        required: ['projectId']
      }
      const valid = validate(schema, req.query)
      if (valid === true) {
        const projectId = req.query.projectId as string
        const project = await Projects.findByPk(projectId)
        if (project) {
          const sprints = await SprintsModel.findAll({ where: { projectId } })
          return sendSuccessResponse('success', sprints, res)
        } else {
          return sendErrorResponse(400, 'Project not found', res)
        }
      } else {
        return sendErrorResponse(400, { ...valid }, res)
      }
    } catch (error) {
      console.debug(error)
      sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Single Sprint
   * @param req
   * @param res
   * @returns
   */
  @Get('/:id', { middleware: [authenticated] })
  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id
      const result = await SprintsModel.findByPk(id)
      return sendSuccessResponse('success', result, res)
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Add Sprint
   * @param req
   * @param res
   * @returns
   */
  @Post('/', { middleware: [authenticated] })
  async create(req: Request, res: Response) {
    try {
      const schema: ValidationSchema<Sprint & { projectId: string }> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          projectId: { type: 'string' },
          status: {
            type: 'string',
            enum: [
              SprintStatus.COMPLETED,
              SprintStatus.INPROGRESS,
              SprintStatus.NOT_STARTED,
              SprintStatus.OVERDUE
            ]
          },
          goals: { type: 'array', items: { type: 'string' } }
        },
        required: ['name', 'projectId', 'goals', 'status'],
        additionalProperties: false
      }
      const valid = validate(schema, req.body)
      if (valid === true) {
        const sprint = req.body
        const project = await Projects.findByPk(sprint.projectId)
        if (project) {
          const result = await SprintsModel.create(sprint)
          await ProjectLogs.create({
            log: {
              action: 'created',
              id: result.id,
              code: sprint.name,
              item: 'sprint'
            },
            projectId: sprint.projectId,
            userId: (req.user as any).id
          })
          return sendSuccessResponse('success', result, res)
        } else {
          return sendErrorResponse(400, 'Project not found', res)
        }
      } else {
        return sendErrorResponse(400, { ...valid }, res)
      }
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Update Sprint
   * @param req
   * @param res
   * @returns
   */
  @Put('/:id', { middleware: [authenticated] })
  async update(req: Request, res: Response) {
    try {
      const schema: ValidationSchema<Sprint & { projectId: string }> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          startDate: { type: 'string' },
          endDate: { type: 'string' },
          projectId: { type: 'string' },
          status: {
            type: 'string',
            status: {
              type: 'string',
              enum: [
                SprintStatus.COMPLETED,
                SprintStatus.INPROGRESS,
                SprintStatus.NOT_STARTED,
                SprintStatus.OVERDUE
              ]
            }
          },
          goals: { type: 'array', items: { type: 'string' } }
        },
        required: [],
        additionalProperties: false
      }
      const valid = validate(schema, req.body)
      if (valid === true) {
        let log: any
        const id = req.params.id
        const sprint = req.body
        const result = await SprintsModel.update(sprint, { where: { id } })
        switch (sprint.status) {
          case SprintStatus.COMPLETED:
            {
              log = {
                action: 'moved',
                id,
                code: sprint.name,
                item: 'sprint',
                status: SprintStatus.COMPLETED
              }
            }
            break
          case SprintStatus.INPROGRESS:
            {
              log = {
                action: 'moved',
                id,
                code: sprint.name,
                item: 'sprint',
                status: SprintStatus.INPROGRESS
              }
            }
            break
          case SprintStatus.NOT_STARTED:
            {
              log = {
                action: 'moved',
                id,
                code: sprint.name,
                item: 'sprint',
                status: SprintStatus.NOT_STARTED
              }
            }
            break
          case SprintStatus.OVERDUE:
            {
              log = {
                action: 'moved',
                id,
                code: sprint.name,
                item: 'sprint',
                status: SprintStatus.OVERDUE
              }
            }
            break
        }
        await ProjectLogs.create({
          log: log,
          projectId: sprint.projectId,
          userId: (req.user as any).id
        })
        return sendSuccessResponse('success', result, res)
      } else {
        return sendErrorResponse(400, { ...valid }, res)
      }
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Delete Sprint
   * @param req
   * @param res
   * @returns
   */
  @Delete('/:id', { middleware: [authenticated] })
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id
      const result = await SprintsModel.destroy({ where: { id } })
      return sendSuccessResponse('success', result, res)
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
}
