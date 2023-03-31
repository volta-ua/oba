import logger from "node-color-log";
import configMode from "../config/config";

type LEVELS = "success" | "debug" | "info" | "warn" | "error" | "disable";
const level: LEVELS = <LEVELS>configMode.app.log_level;
logger.setLevel(level);

export default logger;
