import { Router } from 'express';
import RegionsController from '../controllers/RegionsController';

const regionsRoutes = Router();
const regionsController = new RegionsController();

// Rotas
regionsRoutes.post('/create', regionsController.create);
regionsRoutes.get('/region', regionsController.show);
// regionsRoutes.get('/regions/:id', regionsController.findOne);
// regionsRoutes.put('/update/:id', regionsController.update);
// regionsRoutes.delete('/delete/:id', regionsController.delete);

export default regionsRoutes;
