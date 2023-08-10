import {config} from 'dotenv'

config()
const env = process.env.NODE_ENV

const DEV = {
    mode: 'DEV',
    is_dev: true,
    app: {
        port: 5000,
        url: 'localhost:5000',
        log_level: 'debug',
    },
    bot: {
        bot_name: process.env.TELEGRAM_DEV,
        TELEGRAM_API_TOKEN: process.env.TELEGRAM_API_TOKEN_DEV,
        TELEGRAM_CHANNEL_EVENTS: process.env.TELEGRAM_CHANNEL_EVENTS_DEV,
        TELEGRAM_CHANNEL_HEALTH: process.env.TELEGRAM_CHANNEL_HEALTH_DEV,
    },
    db: {
        host: 'localhost',
        database: process.env.DB_NAME,
        username: process.env.DB_USER_DEV,
        password: process.env.DB_PASS_DEV,
    },
    execution: {
        skip_validation: true
    },
    toStringCustom,
}

const PROD = {
    mode: 'PROD',
    is_dev: false,
    app: {
        port: 5000,
        url: process.env.URL_APP,
        log_level: 'debug',
    },
    bot: {
        bot_name: process.env.TELEGRAM_PROD,
        TELEGRAM_API_TOKEN: process.env.TELEGRAM_API_TOKEN_PROD,
        TELEGRAM_CHANNEL_EVENTS: process.env.TELEGRAM_CHANNEL_EVENTS_PROD,
        TELEGRAM_CHANNEL_HEALTH: process.env.TELEGRAM_CHANNEL_HEALTH_PROD,
    },
    db: {
        host: 'localhost',
        database: process.env.DB_NAME,
        username: process.env.DB_USER_PROD,
        password: process.env.DB_PASS_PROD,
    },
    execution: {
        skip_validation: false
    },
    toStringCustom,
}

const configMode = env === PROD.mode ? PROD : DEV

function toStringCustom() {
    const {mode, is_dev, app, execution} = configMode
    return JSON.stringify({mode, is_dev, app, execution})
}

export default configMode
