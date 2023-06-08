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
import validate from '@docsploit/espress/lib/schemaValidator'
import type { Response, Request } from 'express'
import { authenticated } from '../../utils/auth'
import Users from '../user/user.model'
import ProjectsModel, { Project } from './projects.model'
import Contributors from './contributor.model'
import Sprints, { SprintStatus } from '../sprints/sprints.model'
import Tasks, { TaskStatus } from '../tasks/tasks.model'
import Clients from '../clients/clients.model'

/**
 * @name Projects
 */
@Controller('/projects')
export default class Projects {
  /**
   *
   * @name All Projects
   * @desc to get all projects
   * @returns
   */
  @Get('/', { middleware: [authenticated] })
  async getAll(req: Request, res: Response) {
    try {
      const userId = (req.user as any as any)?.id
      const result = await Contributors.findAll({
        where: { userId },
        include: [
          {
            model: ProjectsModel,
            attributes: ['id', 'name', 'description', 'code', 'status', 'createdAt'],
            include: [
              {
                model: Clients,
                attributes: ['name']
              }
            ]
          },
          {
            model: Users,
            attributes: ['id', 'name', 'email']
          }
        ],
        order: [['role', 'DESC']]
      })
      sendSuccessResponse('success', result, res)
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Single Project
   * @param req
   * @param res
   * @returns
   */
  @Get('/:id', { middleware: [authenticated] })
  async getById(req: Request, res: Response) {
    try {
      const result = await ProjectsModel.findByPk(req.params.id)
      let meta: any = {
        hasActiveSprint: false
      }

      if (result) {
        if (req.query.status) {
          const sprint = await Sprints.findOne({
            where: { projectId: req.params.id, status: SprintStatus.INPROGRESS }
          })
          const taskCount = await Tasks.count({ where: { projectId: req.params.id } })
          const done_taskCount = await Tasks.count({
            where: { projectId: req.params.id, status: TaskStatus.DONE }
          })
          if (sprint) {
            const in_progress_count = await Tasks.count({
              where: { sprintId: sprint?.id, status: TaskStatus.INPROGRESS }
            })
            const completed_count = await Tasks.count({
              where: { sprintId: sprint?.id, status: TaskStatus.DONE }
            })
            const todo_count = await Tasks.count({
              where: { sprintId: sprint?.id, status: TaskStatus.TODO }
            })
            meta = {
              hasActiveSprint: true,
              currentSprint: {
                id: sprint.id,
                name: sprint.name,
                start: sprint.startDate,
                end: sprint.endDate,
                goals: sprint.goals
              },
              percentile: (done_taskCount / taskCount) * 100,
              count: {
                inprogress: in_progress_count,
                completed: completed_count,
                todo: todo_count,
                total: in_progress_count + completed_count + todo_count
              }
            }
          }
        }
        const final = result.toJSON()
        sendSuccessResponse('success', { ...final, ...(req.query.status && meta) }, res)
      } else {
        return sendErrorResponse(400, 'Project not found', res)
      }
    } catch (error: any) {
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Add Project
   * @param req
   * @param res
   * @returns
   */
  @Post('/', { middleware: [authenticated] })
  async create(req: Request, res: Response) {
    try {
      const schema: ValidationSchema<Project & { contributors: string[]; userId: string }> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          code: { type: 'string' },
          status: { type: 'string' },
          userId: { type: 'string' },
          clientId: { type: 'string' },
          contributors: { type: 'array', items: { type: 'string' }, nullable: false }
        },
        required: ['name', 'description', 'clientId', 'code', 'status'],
        additionalProperties: false
      }
      req.body.status = 'IN PROGRESS'
      req.body.userId = (req.user as any).id
      const result: any = validate(schema, req.body)
      if (result === true) {
        const { contributors } = req.body
        const project = await ProjectsModel.create({ ...req.body, userId: (req.user as any).id })
        if (contributors && contributors.length > 0) {
          const contrib = contributors.map((contributor: string) => ({
            projectId: project.id,
            userId: contributor,
            role: 'GUEST'
          }))
          contrib.push({ projectId: project.id, userId: (req.user as any).id, role: 'OWNER' })
          await Contributors.bulkCreate(contrib)
        } else {
          await Contributors.create({
            projectId: project.id,
            userId: (req.user as any).id,
            role: 'OWNER'
          })
        }
        sendSuccessResponse('success', project, res)
      } else {
        return sendErrorResponse(400, { ...result }, res)
      }
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   *  @name Update Project
   * @param req
   * @param res
   * @returns
   */
  @Put('/:id', { middleware: [authenticated] })
  async update(req: Request, res: Response) {
    try {
      const schema: ValidationSchema<Project & { contributors: string[] }> = {
        type: 'object',
        properties: {
          name: { type: 'string' },
          description: { type: 'string' },
          clientId: { type: 'string' },
          code: { type: 'string' },
          status: { type: 'string' },
          contributors: { type: 'array', items: { type: 'string' }, nullable: false }
        },
        required: []
      }
      const result = validate(schema, req.body)
      if (result === true) {
        const project = await ProjectsModel.findByPk(req.params.id)
        if (project) {
          const result = await ProjectsModel.update(req.body, {
            where: { id: req.params.id },
            returning: true
          })
          if (result[0] === 1) {
            return sendSuccessResponse('success', result[0], res)
          } else {
            return sendSuccessResponse('success', result[0], res)
          }
        } else {
          return sendErrorResponse(404, 'Project not found', res)
        }
      } else {
        return sendErrorResponse(400, { ...result }, res)
      }
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Delete Project
   * @param req
   * @param res
   * @returns
   */
  @Delete('/:id', { middleware: [authenticated] })
  async delete(req: Request, res: Response) {
    try {
      const project = await ProjectsModel.findByPk(req.params.id)
      if (project) {
        const result = await ProjectsModel.destroy({ where: { id: req.params.id } })
        if (result === 1) {
          return sendSuccessResponse('success', result, res)
        }
      } else {
        return sendErrorResponse(404, 'Project not found', res)
      }
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
}
