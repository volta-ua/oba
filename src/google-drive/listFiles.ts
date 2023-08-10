import {google} from "googleapis";
import logger from "../utils/logger";

export const listFiles = async (authClient: any): Promise<IFile[]> => {
    const drive = google.drive({version: 'v3', auth: authClient})
    const arr: IFile[] = []
    let res = undefined
    let options = {
        q: 'mimeType = \'application/vnd.google-apps.folder\'',
        fields: 'nextPageToken, files(id, name)',
        pageSize: 1000,
        pageToken: ''
    }
    let pageToken = ''
    do {
        res = await drive.files.list(options)
        pageToken = res?.data?.nextPageToken ?? ''
        options.pageToken = pageToken
        res?.data?.files?.map(
            f => arr.push(
                {id: f.id ?? '', name: f.name ?? ''}
            )
        )
        logger.log('Scanned: ' + arr.length)
    } while (pageToken)
    return arr
}

interface IFile {
    id: string,
    name: string
}
