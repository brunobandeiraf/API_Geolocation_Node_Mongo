import fs from 'fs';
import { createLogger, format, transports } from 'winston';

const env = process.env.NODE_ENV;
const logsDir = 'logs';

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

const logger = createLogger({
  level: env === 'dev' ? 'debug' : 'info',
  format: format.combine(
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    //format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    format.printf((info) => {
      const routeInfo = info.route ? ` [${info.route}]` : '';
      return `${info.timestamp} ${info.level}:${routeInfo} ${info.message}`;
    })
  ),
  transports: [
    new transports.Console({
      level: 'info',
      format: format.combine(
        format.colorize(),
        //format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
        format.printf((info) => {
          const routeInfo = info.route ? ` [${info.route}]` : '';
          return `${info.timestamp} ${info.level}:${routeInfo} ${info.message}`;
        })
      ),
    }),
    new transports.File({
      maxsize: 5120000,
      maxFiles: 10000,
      filename: `${__dirname}/winston/info-logs-api.log`,
    }),
  ],
});

export default logger;
