import { Router } from 'express'
import RegionsController from '../controllers/RegionsController'

const regionsRoutes = Router()
const regionsController = new RegionsController()

// Rotas
regionsRoutes.post('/create', regionsController.create)
regionsRoutes.get('/', regionsController.show)
regionsRoutes.get('/show/:id', regionsController.findOne)
regionsRoutes.put('/update/:id', regionsController.update)
regionsRoutes.delete('/delete/:id', regionsController.delete)
regionsRoutes.get('/regionslist', regionsController.listRegionsContainingPoint)
regionsRoutes.get(
  '/regionsdistance',
  regionsController.listRegionsWithinDistance,
)

export default regionsRoutes
