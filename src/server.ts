//import * as app from 'express';
//import { UserModel } from './models';

import express from 'express';
import routes from './http/routes';

import cors from 'cors';

//const server = app();
//const router = app.Router();
const server = express()
server.use(express.json())

server.use(routes)
server.use(cors())


// router.get('/user', async (req, res) => {
//   const { page, limit } = req.query;

//   const [users, total] = await Promise.all([
//     UserModel.find().lean(),
//     UserModel.count(),
//   ]);

//   return res.json({
//     rows: users,
//     page,
//     limit,
//     total,
//   });
// });

// router.get('/users/:id', async (req, res) => {
//   const { id } = req.params;

//   const user = await UserModel.findOne({ _id: id }).lean();

//   if (!user) {
//     res.status(STATUS.INTERNAL_SERVER_ERROR).json({ message: 'Region not found' });
//   }

//   return user;
// });

// router.put('/users/:id', async (req, res) => {
//   const { id } = req.params;
//   const { update } = req.body;

//   const user = await UserModel.findOne({ _id: id }).lean();

//   if (!user) {
//     res.status(STATUS.DEFAULT_ERROR).json({ message: 'Region not found' });
//   }

//   user.name = update.name;

//   await user.save();

//   return res.sendStatus(201);
// });

//server.use(router);
//export default server.listen(3003);

const PORT = 3003
export default server.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))