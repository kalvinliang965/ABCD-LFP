import path from 'path';
import winston from 'winston';
import fs from "fs";
import { debug } from 'console';
import { dev } from '../../config/environment';

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
    return `${date.toISOString().split('T')[0]}_${model}.log`;
}

const base_format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true })
);

export const route_logger = winston.createLogger({
  level: 'http', 
  format: winston.format.combine(
    base_format,
    winston.format.label({ label: 'ROUTE' }),
    winston.format.metadata({ fillExcept: ['message', 'level', 'timestamp', 'label'] }),
    // we can add more
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

export const simulation_logger = winston.createLogger({
  level: dev.is_dev?'debug': "info",
  format: winston.format.combine(
    base_format,
    winston.format.label({ label: 'SIMULATION' }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, label }) => {
          return `[${label}] ${timestamp} ${level}: ${message}`;
        })
      )
    }),
    new winston.transports.File({ 
      filename: path.join(logsDir, generate_filename("simulation")),
      level: dev.is_dev?'debug': "info",
    }),
  ],
});

export const tax_logger = winston.createLogger({
  level: dev.is_dev?'debug': "info",
  format: winston.format.combine(
    base_format,
    winston.format.label({ label: 'TAX' }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, label }) => {
          return `[${label}] ${timestamp} ${level}: ${message}`;
        })
      ),
    }),
    new winston.transports.File({
      filename: path.join(logsDir, generate_filename("tax")),
      level: dev.is_dev? "debug": "info",
    })
  ],
});