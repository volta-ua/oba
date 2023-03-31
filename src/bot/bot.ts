import {Response} from "express-serve-static-core";
import axios from "axios";
import configMode from "../config/config";

const TELEGRAM_URI = `https://api.telegram.org/bot${configMode.bot.TELEGRAM_API_TOKEN}`
const TELEGRAM_URI_SEND_MESSAGE = `${TELEGRAM_URI}/sendMessage`
//const TELEGRAM_URI_FILE = `https://api.telegram.org/file/bot${configMode.bot.TELEGRAM_API_TOKEN}`
//const TELEGRAM_URI_FILE_ID = `${TELEGRAM_URI}/getFile?file_id=`

export const sendMessage = async (res: Response, chatId: string, text: string, options = {}) => {
    try {
        await axios.post(TELEGRAM_URI_SEND_MESSAGE, {
            chat_id: chatId, text: text, ...options
        })
        res.send('Done')
    } catch (e) {
        console.log(e)
        res.send(e)
    }
}
