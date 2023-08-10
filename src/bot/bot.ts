import axios from "axios"
import configMode from "../config/config"
import logger from "../utils/logger";

const TELEGRAM_URI = `https://api.telegram.org/bot${configMode.bot.TELEGRAM_API_TOKEN}`
const TELEGRAM_URI_SEND_MESSAGE = `${TELEGRAM_URI}/sendMessage`
const TELEGRAM_URI_PHOTO = `${TELEGRAM_URI}/sendPhoto`

export const sendMessage = async (chatId: string, text: string, options = {}): Promise<void> => {
    try {
        await axios.post(
            TELEGRAM_URI_SEND_MESSAGE,
            {
                chat_id: chatId, text, ...options
            }
        )
    } catch (e) {
        logger.error(e)
    }
}

export const sendPhoto = async (chatId: string, photo: any, caption: string, options: any): Promise<void> => {
    try {
        await axios.post(TELEGRAM_URI_PHOTO, {
            chat_id: chatId, photo: photo, caption: caption, ...options
        })
    } catch (e) {
        logger.log(e)
    }
}
