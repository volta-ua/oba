import {config} from 'dotenv'

config()
const env = process.env.NODE_ENV

const DEV = {
    mode: 'DEV',
    is_dev: true,
    app: {
        port: 5000,
        url: 'www.localhost:5000',
        log_level: 'debug',
    },
    bot: {
        bot_name: process.env.TELEGRAM_DEV,
        TELEGRAM_API_TOKEN: process.env.TELEGRAM_API_TOKEN_DEV
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
        TELEGRAM_API_TOKEN: process.env.TELEGRAM_API_TOKEN_PROD
    },
    toStringCustom,
}

const configMode = env === PROD.mode ? PROD : DEV

function toStringCustom() {
    const { mode, is_dev, app } = configMode
    return JSON.stringify({ mode, is_dev, app })
}

export default configMode
