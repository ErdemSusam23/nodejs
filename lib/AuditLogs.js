const AuditLogsModel = require("../db/models/AuditLogs");
const Enums = require("../config/Enums");

// DİKKAT: Sadece LoggerClass'ı çağırıyoruz. Winston'ı (logger.js) o halledecek.
const LoggerClass = require("./logger/LoggerClass"); 

let instance = null;

class AuditLogs {
    constructor() {
        if (!instance) { instance = this; }
        return instance;
    }

    info(email, location, proc_type, log) {
        // Konsol/Dosya Logu
        LoggerClass.info(email, location, proc_type, log);
        // Veritabanı Logu
        this.#saveToDB({ level: Enums.LOG_LEVELS.INFO, email, location, proc_type, log });
    }

    warn(email, location, proc_type, log) {
        LoggerClass.warn(email, location, proc_type, log);
        this.#saveToDB({ level: Enums.LOG_LEVELS.WARN, email, location, proc_type, log });
    }

    error(email, location, proc_type, log) {
        LoggerClass.error(email, location, proc_type, log);
        this.#saveToDB({ level: Enums.LOG_LEVELS.ERROR, email, location, proc_type, log });
    }

    debug(email, location, proc_type, log) {
        LoggerClass.debug(email, location, proc_type, log);
        this.#saveToDB({ level: Enums.LOG_LEVELS.DEBUG, email, location, proc_type, log });
    }

    verbose(email, location, proc_type, log) {
        LoggerClass.verbose(email, location, proc_type, log);
        this.#saveToDB({ level: Enums.LOG_LEVELS.VERBOSE, email, location, proc_type, log });
    }

    http(email, location, proc_type, log) {
        LoggerClass.http(email, location, proc_type, log);
        this.#saveToDB({ level: Enums.LOG_LEVELS.HTTP, email, location, proc_type, log });
    }

    #saveToDB({ level, email, location, proc_type, log }) {
        AuditLogsModel.create({ level, email, location, proc_type, log })
        .catch((err) => {
            // Veritabanı hatası alırsak bunu da konsola basmalıyız
            LoggerClass.error("SYSTEM", "AuditLogs", "SAVE_ERROR", { message: err.message });
        });
    }
}

module.exports = new AuditLogs();