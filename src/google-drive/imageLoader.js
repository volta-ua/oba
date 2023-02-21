import {google} from "googleapis";
import fs from 'fs'
import {authorize} from "./auth.js";

export class ImageLoader {
    static _client;

    async init() {
        this._client = await authorize()
    }

    async downloadFile(fileId, newName) {
        const writableStream = fs.createWriteStream('public/images/' + newName + '.jpg');
        try {
            const drive = google.drive({version: 'v3', auth: this._client});
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
    }
}
