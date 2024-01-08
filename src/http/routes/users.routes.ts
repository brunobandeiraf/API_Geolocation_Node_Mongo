import { Router } from 'express'
import UsersController from '../controllers/UsersController'

const usersRoutes = Router()
const usersController = new UsersController()

// Rotas
usersRoutes.post('/create', usersController.create)
usersRoutes.get('/', usersController.show)
usersRoutes.get('/show/:id', usersController.findOne)
usersRoutes.put('/update/:id', usersController.update)
usersRoutes.delete('/delete/:id', usersController.delete)

export default usersRoutes
