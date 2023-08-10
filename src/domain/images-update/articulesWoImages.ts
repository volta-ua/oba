import path from "path"
import {COL_STK_ARTICUL} from "../../config/constants"
import {reloadArrStk} from "../extractors"

export const articulesWoImages = async (): Promise<string[]> => {
    const fld = path.join('public', 'images')
    const fs = require('fs')
    const imgPublish: string[] = []
    fs.readdir(fld, (err: Error, files: string[]) => {
        if (err) throw err
        files.forEach(file => {
            imgPublish.push(file.substring(0, 5))
        })
    })
    const stocked = await reloadArrStk()
    const absent = []
    for (const stk of stocked) {
        let art = stk[COL_STK_ARTICUL - 1]
        if (!imgPublish.includes(art)) absent.push(art)
    }
    return absent
}
