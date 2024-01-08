import { Router } from 'express'
import usersRoutes from './users.routes'
import regionsRoutes from './regions.routes'

const routes = Router()

// Rotas dos controllers
routes.use('/users', usersRoutes)
routes.use('/regions', regionsRoutes)

export default routes
