import {config} from 'dotenv'

config()
const env = process.env.NODE_ENV

const DEV = {
    mode: 'DEV',
    is_dev: true,
    app: {
        port: 5000
    },
    bot: {
        bot_name: process.env.TELEGRAM_DEV,
        TELEGRAM_API_TOKEN: process.env.TELEGRAM_API_TOKEN_DEV
    }
}

const PROD = {
    mode: 'PROD',
    is_dev: false,
    app: {
        port: 5000
    },
    bot: {
        bot_name: process.env.TELEGRAM_PROD,
        TELEGRAM_API_TOKEN: process.env.TELEGRAM_API_TOKEN_PROD
    }
}

const configMode = {
    DEV,
    PROD
}

export default configMode[env]