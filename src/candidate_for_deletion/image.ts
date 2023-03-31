/*
import fs from 'fs'
import {google} from 'googleapis'

const SCOPES = ['https://www.googleapis.com/auth/drive.metadata.readonly']
const TOKEN_PATH = 'token.json'

function authorize(credentials, callback) {
    const {client_secret, client_id, redirect_uris} = credentials.installed
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0])

    fs.readFile(TOKEN_PATH, (err, token) => {
        if (err) return getAccessToken(oAuth2Client, callback)
        oAuth2Client.setCredentials(JSON.parse(token))
        callback(oAuth2Client)
    })
}

function uploadFile(auth) {
    const drive = google.drive({version: 'v3', auth})
    const fileMetadata = {
        'name': 'photo.jpg'
    }
    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream('files/photo.jpg')
    }
    drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id'
    }, (err, file) => {
        if (err) {
            console.error(err)
        } else {
            console.log('File Id: ', file.id)
        }
    })
}

export function writeImage(content: any) {
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err)
        authorize(JSON.parse(content.toString()), uploadFile)
    })
}
*/
