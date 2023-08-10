import fs from 'fs'
import logger from "../utils/logger";

export async function downloadFile(drive: any, fileId: string, newName: string) {
    const writableStream = fs.createWriteStream(newName)
    try {
        const result = await drive.files.get({
                fileId: fileId,
                alt: 'media'
            },
            {responseType: 'stream'}
        )
        if (result) {
            result.data.pipe(writableStream)
        }
    } catch (err) {
        logger.error(err)
        throw err;
    }
    logger.info('downloadFile ' + newName)
}
