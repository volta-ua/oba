import {NP_METHOD_WH, NP_METHOD_POST, NP_METHOD_DOOR} from '../config/constants'
import configMode from "../config/config"
import logger from '../utils/logger'

export function isValidPhonePartner(phonePartner: string) {
    return phonePartner.match('^\\+380[0-9]{9}$') || configMode.execution.skip_validation
}

export function isValidNPmethod(npMethod: string) {
    return [
        NP_METHOD_WH,
        NP_METHOD_POST,
        NP_METHOD_DOOR
    ].includes(npMethod) || configMode.execution.skip_validation
}

export function isClientNameValid(nameRec: string, npMethod: string | undefined) {
    return (
        npMethod === NP_METHOD_DOOR.toLowerCase()
            ? nameRec.match('^[A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,}$')
            : nameRec.match('^[A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,}( [A-Ґяґєії-]{2,}){0,1}$')
    ) || configMode.execution.skip_validation
}

export function isClientPhoneValid(phoneClient: string) {
    return phoneClient.match('^0[0-9]{9}$') || configMode.execution.skip_validation
}

export function isNpWhValid(wh: number) {
    return wh >= 1 && wh <= 1000 || configMode.execution.skip_validation
}

export function isUpIndexValid(upIndex: string) {
    return upIndex.length === 5 || configMode.execution.skip_validation
}

export function isItemValid(item: string, arrStk: any[]) {//check because dictArticuls was replaced by arrStk
    return arrStk.includes(item) || configMode.execution.skip_validation
}

export function isSizeValid(size: number, SIZES: number[]) {
    return SIZES.includes(size) || configMode.execution.skip_validation
}

export function isQtyValid(qtyAct: number, qtyMax: number) {
    return (qtyAct >= 1 && qtyAct <= qtyMax) || configMode.execution.skip_validation
}

/*
export async function isValidPhotoPaym(photo: any) {
    const fileId = photo.file_id
    try {
        const resp1 = await axios.get(TELEGRAM_URI_FILE_ID + fileId)
        const filePath = resp1.data?.result?.file_path
        const resp2 = await axios.get(TELEGRAM_URI_FILE + '/' + filePath)
        const photoStream = resp2.data
        writeImage(photoStream)
        return true
    } catch (e) {
        logger.log(e)
        return false
    }
}
*/
export function isLegalInputForRegExp(input: string) {
    let isOk = true
    try {
        ''.match(input)
    } catch (e) {
        logger.error(e)
        isOk = false
    }
    return isOk
}
