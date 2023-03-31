import {NP_METHOD_WH, NP_METHOD_POST, NP_METHOD_DOOR} from '../config/constants'
import {CONF} from '../index'

export function isValidPhonePartner(phonePartner: string) {
    return phonePartner.match('^\\+380[0-9]{9}$') || CONF.skip_validation
}

export function isValidNPmethod(npMethod: string) {
    return [
        NP_METHOD_WH,
        NP_METHOD_POST,
        NP_METHOD_DOOR
    ].includes(npMethod) || CONF.skip_validation
}

export function isClientNameValid(nameRec: string, npMethod: string) {
    return (
        npMethod === NP_METHOD_DOOR.toLowerCase()
            ? nameRec.match('^[A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,}$')
            : nameRec.match('^[A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,}( [A-Ґяґєії-]{2,}){0,1}$')
    ) || CONF.skip_validation
}

export function isClientPhoneValid(phoneClient: string) {
    return phoneClient.match('^0[0-9]{9}$') || CONF.skip_validation
}

export function isNpWhValid(wh: number) {
    return wh >= 1 && wh <= 1000 || CONF.skip_validation
}

export function isUpIndexValid(upIndex: string) {
    return upIndex.length === 5 || CONF.skip_validation
}

export function isItemValid(item: string, arrStk: any[]) {//check because dictArticuls was replaced by arrStk
    return arrStk.includes(item) || CONF.skip_validation
}

export function isSizeValid(size: number, SIZES: number[]) {
    return SIZES.includes(size) || CONF.skip_validation
}

export function isQtyValid(qtyAct: number, qtyMax: number) {
    return (qtyAct >= 1 && qtyAct <= qtyMax) || CONF.skip_validation
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
        console.log(e)
        return false
    }
}
*/
export function isLegalInputForRegExp(input: string) {
    let isOk = true
    try {
        ''.match(input)
    } catch (e) {
        console.error(e)
        isOk = false
    }
    return isOk
}
