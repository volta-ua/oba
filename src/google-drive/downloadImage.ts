/*
import {google} from "googleapis";
import fs from 'fs'

export async function downloadFile(auth, fileId, newName) {
    const writableStream = fs.createWriteStream(newName);
    try {
        const drive = google.drive({version: 'v3', auth: auth});
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
        console.error(err)
        throw err;
    }
    console.log('downloadFile ' + newName)
}
*/
