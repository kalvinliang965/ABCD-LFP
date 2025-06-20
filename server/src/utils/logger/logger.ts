import path from 'path';
import winston from 'winston';
import fs from "fs";
import { env_status } from '../../config/environment';

// create logs folder
const project_root = path.join(__dirname, `../../../`);
const logsDir = path.join(project_root, 'logs');
console.log(logsDir);
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
  console.log("A logs folder been created at", logsDir)
}

const generate_filename = (model: string) => {
  const date = new Date();
  const isoString = date.toISOString();
  const timestamp = isoString.slice(0, 19).replace(/[:T]/g, '-');
  return `${timestamp}_${model}.log`;
}

const base_format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true })
);

let level = env_status.is_dev?'debug': "info";
// let level = "error";

export const simulation_logger = winston.createLogger({
  level: env_status.is_test ? 'error' : level, // use error or any valid level
  silent: env_status.is_test, // this disables ALL logging
  format: winston.format.combine(
    base_format,
    winston.format.label({ label: 'SIMULATION' }),
    winston.format.json(),
  ),
  transports: env_status.is_test
    ? [] // you can leave this empty because `silent: true` handles it
    : [
        new winston.transports.Console({
          level,
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.printf(({ level, message, timestamp, label }) => {
              return `[${label}] ${timestamp} ${level}: ${message}`;
            })
          )
        }),
        new winston.transports.File({ 
          filename: path.join(logsDir, generate_filename("simulation")),
          level,
        }),
      ],
});


//let level = "error";
// export const simulation_logger = winston.createLogger({
//   level,
//   format: winston.format.combine(
//     base_format,
//     winston.format.label({ label: 'SIMULATION' }),
//     winston.format.json(),
//   ),
//   transports: [
//     new winston.transports.Console({
//       level,
//       format: winston.format.combine(
//         winston.format.colorize(),
//         winston.format.printf(({ level, message, timestamp, label }) => {
//           return `[${label}] ${timestamp} ${level}: ${message}`;
//         })
//       )
//     }),
//     new winston.transports.File({ 
//       filename: path.join(logsDir, generate_filename("simulation")),
//       level,
//     }),
//   ],
// });