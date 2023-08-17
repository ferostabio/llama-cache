import winston, { format, transports } from "winston";

const fileFormat = format.combine(format.timestamp(), format.json());
const fileMaxSize = 1024 * 1024 * 5; // 5MB
const fileMaxFiles = 5;

export const logger = winston.createLogger({
  level: "info",
  transports: [
    // Write all logs with level `error` to `error.log`
    new transports.File({
      format: fileFormat,
      filename: "error.log",
      level: "error",
      maxsize: fileMaxSize,
      maxFiles: fileMaxFiles,
    }),
    // Write all logs with level `info` and below to `combined.log`
    new transports.File({
      format: fileFormat,
      filename: "combined.log",
      maxsize: fileMaxSize / 5, // 1MB
      maxFiles: fileMaxFiles / 5, // Only one
    }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(
          (info) => `${info.timestamp} ${info.level}: ${info.message}`
        )
      ),
    })
  );
}
