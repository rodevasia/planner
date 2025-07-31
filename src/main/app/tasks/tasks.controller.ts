import {
  Controller,
  Delete,
  Get,
  Post,
  Put,
  ValidationSchema,
  getEnv,
  sendErrorResponse,
  sendSuccessResponse
} from '@docsploit/espress'
import { authenticated } from '../../utils/auth'
import type { Response, Request } from 'express'
import TasksModel, { Task, TaskStatus, getTaskQuerySchema } from './tasks.model'
import validate from '@docsploit/espress/lib/schemaValidator'
import Projects from '../projects/projects.model'
import ProjectLogs from '../project_logs/project_logs.model'
import { multerMultiFieldHandler } from '../../utils/uploader'
import { sequelize } from '../../utils/database'
import { Op } from 'sequelize'
// import { upload } from "../../utils/uploader";

/**
 * @name Tasks
 */
@Controller('/tasks')
export default class Tasks {
  /**
   * @name All Tasks
   * @param req
   * @param res
   * @returns
   */
  @Get('/', { middleware: [authenticated], schema: getTaskQuerySchema })
  async getAll(req: Request, res: Response) {
    try {
      let limit
      let offset
      if (req.query.page) {
        limit = 10
        offset = 0 + (parseInt(req.query.page as string) - 1) * limit
        delete req.query.page
      }
      const tasks = await TasksModel.findAndCountAll({
        where: { ...req.query },
        order: [
          sequelize!.literal(
            "CASE WHEN status = 'INPROGRESS' THEN 1 WHEN status = 'TODO' THEN 2 WHEN status = 'DONE' THEN 3 END"
          ),
          ['updatedAt', 'DESC']
        ],
        offset,
        limit
      })
      return sendSuccessResponse('success', tasks, res)
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }

  @Get('/search', { middleware: [authenticated] })
  async searchIssues(req: Request, res: Response) {
    try {
      const { project, key } = req.query
      if (project) {
        const list = await TasksModel.findAndCountAll({
          where: {
            projectId: project as string,
            issue: {
              [Op.iLike]: `%${key}%`
            }
          }
        })
        sendSuccessResponse('success', list, res)
      } else {
        return sendErrorResponse(400, 'Project is no set', res)
      }
    } catch (error) {
      console.log(error)

      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Single Task
   */
  @Get('/:id', { middleware: [authenticated] })
  async getById(req: Request, res: Response) {
    try {
      const id = req.params.id as string
      const task = await TasksModel.findOne({ where: { id } })
      if (!task) {
        return sendErrorResponse(400, 'Task not found', res)
      }
      return sendSuccessResponse('success', task, res)
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Add Task
   * @param req
   * @param res
   * @returns
   */
  @Post('/', {
    middleware: [
      authenticated,
      multerMultiFieldHandler(
        [{ name: 'attr_1' }, { name: 'attr_2' }, { name: 'attr_3' }],
        getEnv("BUCKET_NAME"),
        ['image/jpg', 'image/jpeg', 'image/png', 'image/webp']
      )
    ]
  })
  async create(req: Request, res: Response) {
    try {
      req.body.status = TaskStatus.TODO
      const schema: ValidationSchema<
        Omit<
          Task & {
            sprintId: string
            attr_1: string
            attr_2: string
            attr_3: string
            projectId: string
          },
          'code' | 'attachments' | 'billed'
        >
      > = {
        type: 'object',
        properties: {
          issue: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', minLength: 1, maxLength: 255 },
          attr_1: { type: 'string' },
          attr_2: { type: 'string' },
          attr_3: { type: 'string' },
          duration: { type: 'string' },
          sprintId: { type: 'string' },
          projectId: { type: 'string' },
          status: { type: 'string' }
        },
        required: ['issue', 'sprintId'],
        additionalProperties: false
      }
      const valid = validate(schema, req.body)
      if (valid === true) {
        const sprintId = req.body.sprintId as string
        const project = await Projects.findByPk(req.body.projectId)
        if (!project) {
          return sendErrorResponse(400, 'Project not found', res)
        }
        const projectCode = project.code
        let code = ''
        const prev_task = await TasksModel.findOne({
          where: { projectId: req.body.projectId },
          order: [['createdAt', 'DESC']]
        })
        if (prev_task) {
          const prev_code = prev_task.code
          const prev_code_split = prev_code.split('-')
          const prev_code_number = parseInt(prev_code_split[1])
          const new_code_number = prev_code_number + 1
          code = `${projectCode}-${new_code_number}`
        } else {
          code = `${projectCode}-1`
        }
        const attachments: any[] = (req.files as any) ?? []
        const body = { ...req.body }
        delete body.attr_1
        delete body.attr_2
        delete body.attr_3
        const task = await TasksModel.create({
          ...body,
          code,
          attachments,
          sprintId
        })
        await ProjectLogs.create({
          log: {
            action: 'created',
            code,
            item: 'issue',
            id: task.id
          },
          projectId: req.body.projectId,
          userId: (req.user as any).id
        })
        return sendSuccessResponse('success', task, res)
      } else {
        return sendErrorResponse(400, { ...valid }, res)
      }
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
  /**
   * @name Update Task
   */
  @Put('/:id', { middleware: [authenticated] })
  async update(req: Request, res: Response) {
    try {
      const schema: ValidationSchema<
        Omit<Task & { sprintId: string; projectId: string }, 'billed'>
      > = {
        type: 'object',
        properties: {
          issue: { type: 'string', minLength: 1, maxLength: 255 },
          description: { type: 'string', minLength: 1, maxLength: 255 },
          attachments: { type: 'array', items: { type: 'string' } },
          duration: { type: 'string' },
          sprintId: { type: 'string' },
          projectId: { type: 'string' },
          code: { type: 'string', minLength: 1, maxLength: 255 },
          status: {
            type: 'string',
            enum: [TaskStatus.TODO, TaskStatus.INPROGRESS, TaskStatus.DONE]
          }
        },
        required: [],
        additionalProperties: false
      }
      const valid = validate(schema, req.body)
      if (valid === true) {
        const id = req.params.id
        const issue = req.body
        const action = req.query.action
        const result = await TasksModel.update(issue, { where: { id } })
        if (action === 'status' || action === 'first_stop' || action === 'first_pause') {
          if (result[0] > 0) {
            switch (issue.status) {
              case TaskStatus.TODO:
                await ProjectLogs.create({
                  log: {
                    action: 'moved',
                    id,
                    item: 'issue',
                    code: issue.code,
                    status: TaskStatus.TODO
                  },
                  projectId: issue.projectId,
                  userId: (req.user as any).id
                })
                break
              case TaskStatus.INPROGRESS:
                await ProjectLogs.create({
                  log: {
                    action: 'moved',
                    id,
                    code: issue.code,
                    item: 'issue',
                    status: TaskStatus.INPROGRESS
                  },
                  projectId: issue.projectId,
                  userId: (req.user as any).id
                })
                break
              case TaskStatus.DONE:
                await ProjectLogs.create({
                  log: {
                    action: 'moved',
                    id,
                    code: issue.code,
                    item: 'issue',
                    status: TaskStatus.DONE
                  },
                  projectId: issue.projectId,
                  userId: (req.user as any).id
                })
                break
            }
          }
        }
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
   * @name Delete Task
   * @param req
   * @param res
   * @returns
   */
  @Delete('/:id', { middleware: [authenticated] })
  async delete(req: Request, res: Response) {
    try {
      const id = req.params.id
      const user = (req.user as any)?.id
      const result = await TasksModel.destroy({ where: { id } })
      await ProjectLogs.create({
        log: {
          action: 'deleted',
          code: req.query.code as string,
          item: 'issue',
          status: req.query.status as TaskStatus
        },
        projectId: req.query.projectId as string,
        userId: user
      })
      return sendSuccessResponse('success', result, res)
    } catch (error) {
      console.debug(error)
      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
}
