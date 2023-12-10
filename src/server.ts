//import { UserModel } from './repositories/models';
import './db/database'; 

import express from 'express';
import routes from './http/routes';

import cors from 'cors';

const server = express()
server.use(express.json())

server.use(routes)
server.use(cors())

const PORT = 3003
export default server.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))