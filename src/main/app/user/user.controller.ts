import { Controller, Get, sendErrorResponse, sendSuccessResponse } from '@docsploit/espress'
import type { Request, Response } from 'express'
import Users from './user.model'
import { Op } from 'sequelize'
@Controller('/user')
export default class User {
  @Get('/search')
  async searchContributor(req: Request, res: Response) {
    try {
      const email = req.query.email as string
      if (email) {
        const user = await Users.findOne({
          where: {
            email,
            id: {
              [Op.not]: (req.user as any)?.id
            }
          }
        })
        if (user) {
          return sendSuccessResponse(
            'success',
            { id: user.id, name: user.name, email: user.email },
            res
          )
        }
      }
      return sendSuccessResponse('success', {}, res)
    } catch (error) {
      console.log(error)

      return sendErrorResponse(500, 'Internal Server Error', res)
    }
  }
}
