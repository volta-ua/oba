import axios from "axios";
import {
    NP_METHOD_DOOR, NP_METHOD_POST, NP_METHOD_WH,
    TELEGRAM_URI_FILE_ID, TELEGRAM_URI_FILE
} from "../index.js";
import {writeImage} from "../candidate_for_deletion/image.js";

export function isValidPhonePartner(phonePartner) {
    return phonePartner.match('^\\+380[0-9]{9}$') || CONF.skip_validation
}

export function isValidNPmethod(npMethod) {
    return [
        NP_METHOD_WH,
        NP_METHOD_POST,
        NP_METHOD_DOOR
    ].includes(npMethod) || CONF.skip_validation
}

export function isClientNameValid(nameRec, npMethod) {
    return (
        npMethod === NP_METHOD_DOOR.toLowerCase()
            ? nameRec.match('^[A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,}$')
            : nameRec.match('^[A-Ґяґєії-]{2,} [A-Ґяґєії-]{2,}( [A-Ґяґєії-]{2,}){0,1}$')
    ) || CONF.skip_validation
}

export function isClientPhoneValid(phoneClient) {
    return phoneClient.match('^0[0-9]{9}$') || CONF.skip_validation
}

export function isNpWhValid(wh) {
    return wh >= 1 && wh <= 1000 || CONF.skip_validation
}

export function isUpIndexValid(upIndex) {
    return upIndex.length === 5 || CONF.skip_validation
}

export function isItemValid(item) {
    return dictArticles.includes(item) || CONF.skip_validation
}

export function isSizeValid(size, SIZES) {
    return SIZES.includes(size) || CONF.skip_validation
}

export function isQtyValid(qtyAct, qtyMax) {
    return (qtyAct >= 1 && qtyAct <= qtyMax) || CONF.skip_validation
}

export async function isValidPhotoPaym(photo) {
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

export function isLegalInputForRegExp(input) {
    let isOk = true
    try {
        ''.match(input)
    } catch (e) {
        console.error(e)
        isOk = false
    }
    return isOk
}
