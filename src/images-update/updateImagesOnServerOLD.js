import {downloadFile} from "../google-drive/downloadImage.ts";
import fs from "node:fs/promises";
import path from "node:path";
import {uniqueTwoDimArr} from "../utils/service.ts";
import {authorize} from "../google-drive/auth.ts";
import TblImageScanner from "../google-sheet/models/TblImageScanner.js";
import {ADDR_IMG_DATA, SH_IMG} from "../config/constants.ts";
import {reloadImg} from "../index.ts";

// think about refactoring
const IND_IMG_ART = 0
const IND_IMG_ID = 1
//

async function clearImagesFolder() {
    const FOLDER_IMAGES = 'public/images';
    if (!FOLDER_IMAGES) throw new Error('Root directory deleting prohibited')
    for (const file of await fs.readdir(FOLDER_IMAGES)) {
        await fs.unlink(path.join(FOLDER_IMAGES, file));
    }
}

export async function updateImagesOnServerOLD() {
    //await clearImagesFolder()
    const {arrImgId} = await reloadImg()
    const auth = await authorize()
    for (const img of arrImgId) {
        await downloadFile(
            auth,
            img[IND_IMG_ID],
            'public/images/' + img[IND_IMG_ART] + '.jpg'
        )
    }
    console.log('updateImagesOnServerOLD')
}

async function scanImagesOnDataSource() {
    const wsImageScanner = await TblImageScanner.createInstance()
    let arrData = await wsImageScanner.getDataRangeBySheet(SH_IMG, ADDR_IMG_DATA)
    arrData = arrData.filter(
        el => el[IND_IMG_ART] && el[IND_IMG_ART] !== '-'
    )
    arrData = uniqueTwoDimArr(arrData, IND_IMG_ART)
    console.log('scanImagesOnDataSource with ' + arrData.length)
    return arrData
}


