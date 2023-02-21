import {ImageLoader} from "./imageLoader.js";
import fs from "node:fs/promises";
import path from "node:path";
import GSheetConnector from "../google-sheet/GSheetConnector.js";
import GSheetTableDefinition from "../google-sheet/GSheetTableDefinition.js";
import {convert2DimArrayInto1Dim, slice2d, uniqueTwoDimArr} from "../utils/service.js";

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
    await clearImagesFolder()
    const images = await scanImagesOnDataSource()
    const imageLoader = new ImageLoader()
    await imageLoader.init()
    for (const img of images) {
        await imageLoader.downloadFile(img[IND_IMG_ID], img[IND_IMG_ART]);
    }
}

async function scanImagesOnDataSource() {
    const tblDef = new GSheetTableDefinition(
        process.env.GOOGLE_SPREADSHEET_ID_IMG, 'FILES',
        1, 1, ['Articul', 'ID'], 1)
    const gs = new GSheetConnector(tblDef);
    await gs.create();
    const layout = tblDef.layout
    let arrData = await gs.getData()
    arrData = arrData.filter(
        el => el[layout.Articul] && el[layout.Articul] !== '-'
    )
    arrData = uniqueTwoDimArr(arrData, layout.Articul)
    console.log(arrData)
    return arrData
}

export async function getArticulesWithPhoto() {
    const arrData = await scanImagesOnDataSource()
    return convert2DimArrayInto1Dim(
        slice2d(arrData, 0, IND_IMG_ART, arrData.length, 1)
    )
}
