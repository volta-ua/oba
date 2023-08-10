import {authorize} from "../google-drive/auth"
import {downloadFile} from "../google-drive/downloadImage"
import {google} from "googleapis"
import path from "path"
import {listFiles} from "../google-drive/listFiles"
import {sendMessage} from "../bot/bot"
import configMode from "../config/config"
import logger from "../utils/logger"
import {reloadArrImages} from "../domain/extractors";

export const updateImagesOnServer = async (): Promise<{ cntImg: number }> => {
    const auth = await authorize()
    const arr = await listFiles(auth)
    let imgFolders = undefined
    if (arr && arr.length > 0) {
        imgFolders = arr.filter(
            f => f.name.match('^[0-9]{5}$')
        )
    }
    let cntImg = 0
    if (imgFolders && imgFolders.length > 0) {
        // @ts-ignore
        const drive = google.drive({version: 'v3', auth})
        for (const fld of imgFolders) {
            const options = {
                q: `'${fld.id}' in parents and trashed = false and name contains '.jpg'`,
                fields: 'files(id, name)',
            }
            let res = await drive.files.list(options)
            // @ts-ignore
            const files = res.data.files
            if (files && files.length > 0) {
                // @ts-ignore
                await downloadFile(drive, files[0].id, path.join('public', 'images', fld.name + '.jpg'))
                logger.debug(cntImg++ + ' downloadFile ' + files[0].id)
            }

        }
    }
    reloadArrImages()
    await sendMessage(configMode.bot.TELEGRAM_CHANNEL_EVENTS ?? '',
        'images updated on server: ' + cntImg)
    return {cntImg}
}
