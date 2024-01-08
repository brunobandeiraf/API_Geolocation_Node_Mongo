import { Request, Response } from 'express'
import { RegionModel } from '../../repositories/models'
import AppError from '../../utils/error/AppError'
import HttpStatus from '../../utils/error/HttpStatus'
import logger from '../../utils/logs/logger'

// Raio da Terra em quilômetros
const EARTH_RADIUS = 6371

class RegionsController {
  async create(request: Request, response: Response) {
    // route POST region/create
    try {
      const { name, user, coordinates } = request.body

      // Verifique se já existe uma região com o mesmo nome e coordenadas do usuário informado
      const existingRegion = await RegionModel.findOne({
        user,
        name,
        coordinates,
      })

      if (existingRegion) {
        logger.warn({
          message:
            'Region with the same name and coordinates already exists for the informed user',
          route: '/regions/create',
        })
        // throw new AppError("Region with the same name and coordinates already exists for the informed user.", HttpStatus.DEFAULT_ERROR)
        return response.status(HttpStatus.DEFAULT_ERROR).json({
          message:
            'Region with the same name and coordinates already exists for the informed user',
        })
      }

      // Crie uma nova instância de Region
      const newRegion = new RegionModel({
        name,
        user,
        ...(coordinates && { coordinates }),
      })

      // A lógica de pré-salvamento será acionada automaticamente para gerar o _id e associar à User
      await newRegion.save()

      logger.info({
        message: 'Region created successfully',
        route: '/regions/create',
      })
      response
        .status(HttpStatus.CREATED)
        .json({ message: 'Region created successfully', region: newRegion })
    } catch (error) {
      logger.error({
        message: 'Internal server error',
        route: '/regions/create',
      })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async show(request: Request, response: Response): Promise<Response> {
    // route GET regions/

    try {
      const { page, limit } = request.query

      const [regions, total] = await Promise.all([
        RegionModel.find().lean(),
        RegionModel.count(),
      ])

      if (total === undefined) {
        logger.warn({
          message: 'Failed to count regions',
          route: '/regions/show',
        })
        // throw new AppError("Failed to count regions.", HttpStatus.DEFAULT_ERROR)
        return response
          .status(HttpStatus.DEFAULT_ERROR)
          .json({ message: 'Failed to count regions' })
      }

      logger.info({ message: 'Listed regions.', route: '/regions/show' })
      return response.status(HttpStatus.OK).json({
        rows: regions,
        page,
        limit,
        total,
      })
    } catch (error) {
      logger.error({ message: 'Internal server error', route: '/regions/show' })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async findOne(request: Request, response: Response) {
    // route GET regions/:id
    try {
      const { id } = request.params
      const region = await RegionModel.findOne({ _id: id }).lean()

      if (!region) {
        logger.warn({ message: 'Region not found.', route: '/regions/id' })
        // throw new AppError("Region not found.", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Region not found' })
      }

      logger.info({ message: 'Region found', route: '/regions/id' })
      return response.status(HttpStatus.OK).json(region)
    } catch (error) {
      logger.error({ message: 'Internal server error', route: '/regions/id' })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async update(request: Request, response: Response) {
    // route PUT regions/update/:id

    try {
      const { id } = request.params
      const { name, userID, coordinates } = request.body

      // Verifique se a região com o ID fornecido existe
      const existingRegion = await RegionModel.findById(id)

      if (!existingRegion) {
        logger.warn({ message: 'Region not found', route: '/regions/id - PUT' })
        // throw new AppError("Region not found.", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Region not found' })
      }

      // Verifique se já existe uma região com o mesmo nome e coordenadas (exceto a região atual) para o mesmo user
      if (name || coordinates || userID) {
        const duplicateRegion = await RegionModel.findOne({
          _id: { $ne: id },
          name,
          coordinates,
          user: userID,
        })

        if (duplicateRegion) {
          logger.warn({
            message:
              'Region with the same name and coordinates already exists for the user',
            route: '/regions/id - PUT',
          })
          // throw new AppError("Region with the same name and coordinates already exists for the user.", HttpStatus.NOT_FOUND)
          return response.status(HttpStatus.NOT_FOUND).json({
            message:
              'Region with the same name and coordinates already exists for the user',
          })
        }
      }

      // Se deseja atualizar
      if (name) existingRegion.name = name
      if (userID) existingRegion.user = userID
      if (coordinates) existingRegion.coordinates = coordinates

      // Salve a região atualizada
      await existingRegion.save()

      logger.info({
        message: 'Region updated successfully',
        route: '/regions/id - PUT',
      })
      return response.status(HttpStatus.UPDATED).json({
        message: 'Region updated successfully',
        region: existingRegion,
      })
    } catch (error) {
      logger.error({
        message: 'Internal server error.',
        route: '/regions/id - PUT',
      })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async delete(request: Request, response: Response) {
    // route DELETE regions/delete/:id

    const regionId = request.params.id

    try {
      const deletedRegion = await RegionModel.findByIdAndDelete(regionId)

      if (!deletedRegion) {
        logger.warn({
          message: 'Region not found',
          route: '/regions/delete/id',
        })
        // throw new AppError("Region not found.", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Region not found' })
      }

      logger.info({
        message: 'User deleted successfully',
        route: '/regions/delete/id',
      })
      return response
        .status(HttpStatus.OK)
        .json({ message: 'User deleted successfully', deletedRegion })
    } catch (error) {
      logger.error({
        message: 'Internal server error',
        route: '/regions/delete/id',
      })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async listRegionsContainingPoint(request: Request, response: Response) {
    // route GET regions/regionslist
    try {
      const { latitude, longitude } = request.body

      if (!latitude || !longitude) {
        logger.warn({
          message: 'Latitude and longitude are required parameters',
          route: '/regions/regionslist',
        })
        // throw new AppError("Latitude and longitude are required parameters.", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'Latitude and longitude are required parameters' })
      }

      const point = {
        coordinates: {
          latitude: parseFloat(latitude as string),
          longitude: parseFloat(longitude as string),
        },
      }

      const regionsContainingPoint = await RegionModel.find({
        'coordinates.latitude': point.coordinates.latitude,
        'coordinates.longitude': point.coordinates.longitude,
      }).lean()

      if (regionsContainingPoint.length === 0) {
        logger.warn({
          message: 'No regions found at the specified point',
          route: '/regions/regionslist',
        })
        // throw new AppError("No regions found at the specified point.", HttpStatus.NOT_FOUND)
        response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'No regions found at the specified point' })
      }

      logger.info({
        message: 'List regions containing point successfully',
        route: '/regions/regionslist',
      })
      return response
        .status(HttpStatus.OK)
        .json({ regions: regionsContainingPoint })
    } catch (error) {
      logger.error({
        message: 'Internal server error',
        route: '/regions/regionslist',
      })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }

  async listRegionsWithinDistance(request: Request, response: Response) {
    try {
      const { latitude, longitude, distance } = request.body

      if (!latitude || !longitude || !distance) {
        logger.warn({
          message: 'Latitude, longitude, and distance are required parameters',
          route: '/regions/regionsdistance',
        })
        // throw new AppError("Latitude, longitude, and distance are required parameters.", HttpStatus.NOT_FOUND)
        return response.status(HttpStatus.NOT_FOUND).json({
          message: 'Latitude, longitude, and distance are required parameters',
        })
      }
      // O código realiza uma consulta ao banco de dados MongoDB para encontrar regiões dentro de uma determinada distância geográfica
      // a partir de um ponto especificado (definido por latitude e longitude).
      const regionsWithinDistance = await RegionModel.find({
        coordinates: {
          $geoWithin: {
            // Método $geoWithin do MongoDB busca regiões dentro de uma distância especificada.
            $centerSphere: [
              // Este método define um círculo na esfera (usando coordenadas esféricas) e busca por documentos dentro desse círculo.
              [parseFloat(longitude), parseFloat(latitude)],
              distance / EARTH_RADIUS,
            ],
          },
        },
      })
        .populate('user')
        .lean()

      if (regionsWithinDistance.length === 0) {
        logger.warn({
          message: 'No regions found at the specified point',
          route: '/regions/regionsdistance',
        })
        // throw new AppError("No regions found at the specified point.", HttpStatus.NOT_FOUND)
        return response
          .status(HttpStatus.NOT_FOUND)
          .json({ message: 'No regions found at the specified point' })
      }

      logger.info({
        message: 'List regions within distance successfully',
        route: '/regions/regionsdistance',
      })
      return response
        .status(HttpStatus.OK)
        .json({ regions: regionsWithinDistance })
    } catch (error) {
      logger.error({
        message: 'Internal server error',
        route: '/regions/regionsdistance',
      })
      // throw new AppError("Internal server error.", HttpStatus.INTERNAL_SERVER_ERROR)
      response
        .status(HttpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: 'Internal server error' })
    }
  }
}

export default RegionsController
