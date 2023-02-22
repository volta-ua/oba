import {downloadFile} from "./downloadImage.js";
import fs from "node:fs/promises";
import path from "node:path";
import GSheetConnector from "../google-sheet/GSheetConnector.js";
import GSheetTableDefinition from "../google-sheet/GSheetTableDefinition.js";
import {convert2DimArrayInto1Dim, slice2d, uniqueTwoDimArr} from "../utils/service.js";
import {authorize} from "./auth.js";
import TblImageScanner from "../google-sheet/models/TblImageScanner.js";
import {ADDR_IMG_DATA, SH_IMG} from "../config/constants.js";
import {reloadImg} from "../index.js";

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

export async function updateImagesOnServer() {
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
    console.log('updateImagesOnServer')
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
