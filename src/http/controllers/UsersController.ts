import { Request, Response, NextFunction } from 'express'
import { UserModel } from '../../repositories/models'
import GeoLocationService from '../../service/GeoLib'
import AppError from '../../utils/error/AppError'
import HttpStatus from '../../utils/error/HttpStatus'
import logger from '../../utils/logs/logger'

const apiKey = '707fb022eab54eb1a6434dd36f3eb91c'

class UsersController {
  async create(request: Request, response: Response) {
    try {
      const { name, email, address, coordinates } = request.body

      // Verifica se foram fornecidos ambos ou nenhum endereço/coordenadas
      if ((!address && !coordinates) || (address && coordinates)) {
        logger.warn({
          message: 'Provide only address or coordinates, not both or neither',
          route: '/users/create',
        })
        // throw new AppError("Provide only address or coordinates, not both or neither.", HttpStatus.BAD_REQUEST)
        return response.status(HttpStatus.BAD_REQUEST).json({
          message: 'Provide only address or coordinates, not both or neither',
        })
      }

      const geoLocationService = new GeoLocationService(apiKey)
      const resolvedLocation = await geoLocationService.resolveLocation({
        address,
        coordinates,
      })

      const user = new UserModel({
        name,
        email,
        ...(resolvedLocation.address && { address: resolvedLocation.address }),
        ...(resolvedLocation.coordinates && {
          coordinates: resolvedLocation.coordinates,
        }),
      })

      await user.save()

      logger.info({
        message: 'User created successfully',
        route: '/users/create',
      })
      return response
        .status(HttpStatus.CREATED)
        .json({ message: 'User created successfully', user })
    } catch (error) {
      logger.error({ message: 'Unexpected error', route: '/users/create' })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      return response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Unexpected error.' })
    }
  }

  async show(request: Request, response: Response): Promise<Response> {
    // route GET users/

    try {
      const { page, limit } = request.query

      const [users, total] = await Promise.all([
        UserModel.find().lean(),
        UserModel.count(),
      ])

      if (total === undefined) {
        logger.warn({ message: 'Failed to count users', route: '/users/show' })
        // throw new AppError("Failed to count users", HttpStatus.DEFAULT_ERROR)
        return response
          .status(HttpStatus.DEFAULT_ERROR)
          .json({ message: 'Failed to count users' })
      }
      logger.info({ message: 'Listed users', route: '/users/show' })
      return response.status(HttpStatus.OK).json({
        rows: users,
        page,
        limit,
        total,
      })
    } catch (error) {
      logger.error({ message: 'Unexpected error.', route: '/users/show' })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      return response
        .status(HttpStatus.DEFAULT_ERROR)
        .json({ message: 'Unexpected error' })
    }
  }

  async findOne(request: Request, response: Response) {
    // route GET users/:id

    try {
      const { id } = request.params

      const user = await UserModel.findOne({ _id: id }).lean()

      if (!user) {
        logger.warn({ message: 'User not found', route: '/users/id' })
        // throw new AppError("User not found", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'User not found' })
      }

      logger.info({ message: 'User found', route: '/users/id' })
      return response.status(HttpStatus.OK).json(user)
    } catch (error) {
      logger.error({ message: 'Unexpected error', route: '/users/id' })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async update(request: Request, response: Response) {
    // route UPDATE users/:id
    try {
      const userId = request.params.id
      const { name, email, address, coordinates } = request.body

      // Verifica se o ID do usuário está presente nos parâmetros da solicitação
      if (!userId) {
        logger.warn({
          message: 'User ID is required for updating',
          route: '/users/update',
        })
        // throw new AppError("User ID is required for updating.", HttpStatus.BAD_REQUEST)
        return response
          .status(HttpStatus.BAD_REQUEST)
          .json({ message: 'User ID is required for updating' })
      }

      const user = await UserModel.findById(userId)
      if (!user) {
        logger.warn({ message: 'User not found', route: '/users/update' })
        // throw new AppError("User not found.", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'User not found.' })
      }
      const geoLocationService = new GeoLocationService(apiKey)
      const resolvedLocation = await geoLocationService.resolveLocation({
        address,
        coordinates,
      })

      const updatedUser = await UserModel.findByIdAndUpdate(
        userId,
        {
          name,
          email,
          ...(resolvedLocation.address && {
            address: resolvedLocation.address,
          }),
          ...(resolvedLocation.coordinates && {
            coordinates: resolvedLocation.coordinates,
          }),
        },
        { new: true }, // Retorna o documento atualizado
      )

      logger.info({
        message: 'User updated successfully',
        route: '/users/update',
      })
      return response
        .status(HttpStatus.UPDATED)
        .json({ message: 'User updated successfully', updatedUser })
    } catch (error) {
      logger.error({ message: 'Unexpected error', route: '/users/update' })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async delete(request: Request, response: Response) {
    // route DELETE users/delete/:id

    const userId = request.params.id

    try {
      const deletedUser = await UserModel.findByIdAndDelete(userId)

      if (!deletedUser) {
        logger.warn({ message: 'User not found', route: '/users/delete' })
        // throw new AppError("User not found.", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'User not found' })
      }

      logger.info({
        message: 'User deleted successfully',
        route: '/users/delete',
      })
      return response
        .status(HttpStatus.OK)
        .json({ message: 'User deleted successfully', deletedUser })
    } catch (error) {
      logger.error({ message: 'Unexpected error', route: '/users/delete' })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }
}

export default UsersController
