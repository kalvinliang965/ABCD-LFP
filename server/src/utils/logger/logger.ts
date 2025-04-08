import path from 'path';
import winston from 'winston';
import fs from "fs";

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
  level: 'debug', 
  format: winston.format.combine(
    base_format,
    winston.format.label({ label: 'SIMULATION' }),
    winston.format.prettyPrint(),
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: path.join(__dirname, 'logs', generate_filename("simulation"))}),
  ],
});

export const tax_logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    base_format,
    winston.format.label({ label: 'TAX' }),
  ),
  transports: [
    new winston.transports.Console(),
  ],
});
