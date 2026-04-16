import { Request, Response, NextFunction } from 'express';

/**
 * Centralized logger utility.
 * Logs structured JSON messages to stdout.
 */

type LogLevel = 'INFO' | 'WARN' | 'ERROR';

function log(level: LogLevel, message: string, meta?: Record<string, unknown>) {
    const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta,
    };
    if (level === 'ERROR') {
        console.error(JSON.stringify(entry));
    } else {
        console.log(JSON.stringify(entry));
    }
}

export const logger = {
    info: (message: string, meta?: Record<string, unknown>) => log('INFO', message, meta),
    warn: (message: string, meta?: Record<string, unknown>) => log('WARN', message, meta),
    error: (message: string, meta?: Record<string, unknown>) => log('ERROR', message, meta),
};

/**
 * Express middleware — logs every incoming API request.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on('finish', () => {
        logger.info('API Request', {
            method: req.method,
            route: req.originalUrl,
            status: res.statusCode,
            durationMs: Date.now() - start,
            ip: req.ip,
        });
    });
    next();
}
