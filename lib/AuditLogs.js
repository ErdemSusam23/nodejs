const AuditLogsModel = require("../db/models/AuditLogs");
const Enums = require("../config/Enums");
const logger = require("./logger/logger"); 
const LoggerClass = require("./logger/LoggerClass");

let instance = null;

class AuditLogs {
    constructor() {
        if (!instance) {
            instance = this;
        }
        return instance;
    }

    info(email, location, proc_type, log) {
        // 1. Önce sadece log dosyasına yaz (LoggerClass üzerinden)
        LoggerClass.info(email, location, proc_type, log);

        // 2. Sonra veritabanına kaydet
        this.#saveToDB({ level: Enums.LOG_LEVELS.INFO, email, location, proc_type, log });
    }

    warn(email, location, proc_type, log) {
        LoggerClass.warn(email, location, proc_type, log);
        this.#saveToDB({
            level: Enums.LOG_LEVELS.WARN,
            email, location, proc_type, log
        });
    }

    error(email, location, proc_type, log) {
        LoggerClass.error(email, location, proc_type, log);

        this.#saveToDB({
            level: Enums.LOG_LEVELS.ERROR,
            email, location, proc_type, log
        });
    }

    debug(email, location, proc_type, log) {
        LoggerClass.debug(email, location, proc_type, log);

        this.#saveToDB({
            level: Enums.LOG_LEVELS.DEBUG,
            email, location, proc_type, log
        });
    }

    verbose(email, location, proc_type, log) {
        LoggerClass.verbose(email, location, proc_type, log);

        this.#saveToDB({
            level: Enums.LOG_LEVELS.VERBOSE,
            email, location, proc_type, log
        });
    }

    http(email, location, proc_type, log) {
        LoggerClass.http(email, location, proc_type, log);

        this.#saveToDB({
            level: Enums.LOG_LEVELS.HTTP,
            email, location, proc_type, log
        });
    }

    #saveToDB({ level, email, location, proc_type, log }) {
        AuditLogsModel.create({
            level, email, location, proc_type, log
        })
        .catch((err) => {
           LoggerClass.error("SYSTEM", "AuditLogs", "SAVE_ERROR", err.message);
        });
    }
}

module.exports = new AuditLogs();