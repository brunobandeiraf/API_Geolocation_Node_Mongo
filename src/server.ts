// import { UserModel } from './repositories/models';
import 'express-async-errors'
import { env } from './env'
import logger from './utils/logs/logger'

import express, { Request, Response, NextFunction } from 'express'
import AppError from '../src/utils/error/AppError'
import './db/database'

import routes from './http/routes'
import cors from 'cors'

const server = express()
server.use(cors())
server.use(express.json())

server.use(routes)

// Tratando erros
// server.use((error: any, request: Request, response: Response, next: NextFunction) => {
//     // Se erro gerado pelo cliente
//     if (error instanceof AppError) {
//       return response.status(error.statusCode).json({
//         status: 'error',
//         message: error.message,
//       });
//     }
//     // Debugar o error, se preciso
//     console.error(error);

//     // Se erro gerado pelo servidor
//     return response.status(500).json({ // Error gerado pelo servidor - mensagem padrão
//       status: 'error',
//       message: 'Internal server error',
//     });
// });

const PORT = env.PORT
export default server.listen(PORT, () =>
  logger.info(`Server is running on Port ${PORT}`),
)
// export default server.listen(PORT, () => console.log(`Server is running on Port ${PORT}`))
