import { Router } from 'express';
import usersRoutes from './users.routes';

const routes = Router();

// Rotas dos controllers
routes.use('/users', usersRoutes);

export default routes;
