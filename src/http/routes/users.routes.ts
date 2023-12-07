import { Router } from 'express';
import UsersController from '../controllers/UsersController';

const usersRoutes = Router();
const usersController = new UsersController();

// Rotas
usersRoutes.get('/user', usersController.show);
usersRoutes.get('/users/:id', usersController.findOne);
//usersRoutes.put('/users/:id', usersController.update);

export default usersRoutes;
