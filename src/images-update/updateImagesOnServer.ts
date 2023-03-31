import {google, drive_v3, Auth} from "googleapis" //Common

const updateImagesOnServer = async () => {
    const auth: Auth.GoogleAuth = new google.auth.GoogleAuth()
    //const auth = await authorize()
    const drive: drive_v3.Drive = google.drive({
        version: 'v3',
        auth,
    })
    //const drive = google.drive({version: 'v3', auth: auth})
    const listParams: drive_v3.Params$Resource$Files$List = {}
    const res = await drive.files.list(listParams)
    const listResults: drive_v3.Schema$FileList = res.data

    console.log(listResults)
    /*
        const files: any[] = []
        try {
            const res = await drive.files.list({
                q: 'mimeType=\'image/jpeg\'',
                fields: 'nextPageToken, files(id, name)',
                spaces: 'drive',
            });
            Array.prototype.push.apply(files, res.files);
            res.data.files.forEach(function (file) {
                logger.log('Found file:', file.name, file.id);
            });
        } catch (err) {
            logger.error(err)
            throw err
        }


        //const folders = scanSubfolders(GD_FOLDER_IMAGES)

    }

    const scanSubfolders = (folder) => {
    */
}

updateImagesOnServer().then(() => console.log('updateImagesOnServer done'))
