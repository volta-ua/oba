import {
    ADDR_DICT_CITIES,
    ADDR_DICT_USER_CONF,
    ADDR_STK_DATA,
    COL_STK_ARTICUL,
    RELOAD_STK_MS,
    SH_DICT,
    SH_STK
} from "../config/constants"
import logger from "../utils/logger"
import fs from "fs"
import {convert2DimArrayInto1Dim} from "../utils/service"
import TblBooking from "../google-sheet/models/TblBooking"
import {appCtx} from "./ApplicationContext";

let wsBooking: TblBooking
export let arrStk: any[][]
export let images: string[] = []
export let userConf: any[]

export const reloadUserConfByExternalRequest = async () => {
    //await wsBooking.reloadInfo()
    await reloadUserConf()
    logger.log('reloaded externally')
}

export const loadDuringStartup = async () => {
    wsBooking = await TblBooking.createInstance()
    //wsBotManager = await TblBotManager.createInstance()
    await reloadArrStk()
    await reloadUserConf()
    reloadArrImages()
}

export const extractDataFromTableOrCache = async (isForce: boolean = false) => {
    let dtNow = new Date()
    if (isForce || dtNow.getTime() - appCtx.reload_stk_last_date.getTime() > RELOAD_STK_MS) {
        await wsBooking.reloadInfo()
        await reloadArrStk()
        appCtx.reload_stk_last_date = dtNow
    }
    logger.log('extractDataFromTableOrCache done with reload_stk_last_date = ' + appCtx.reload_stk_last_date)
}

export const reloadArrStk = async (): Promise<string[][]> => {
    arrStk = await wsBooking.getDataRangeBySheet(SH_STK, ADDR_STK_DATA, COL_STK_ARTICUL - 1)
    logger.log('reloadStk done with ' + arrStk.length)
    return arrStk
}

export const reloadArrImages = (): string[] => {
    fs.readdirSync('public/images').forEach(file => {
        images.push(file.substring(0, 5) + '')
    })
    logger.log('reloadImg done with ' + images.length)
    return images
}

export const reloadUserConf = async (): Promise<string[]> => {
    const data = await wsBooking.getDataRangeBySheet(SH_DICT, ADDR_DICT_USER_CONF)
    userConf = convert2DimArrayInto1Dim(data)
    logger.log('reloadUserConf done ' + userConf)
    return userConf
}

export const reloadArrCities = async (): Promise<string[]> => {
    let cities = await wsBooking.getDataRangeBySheet(SH_DICT, ADDR_DICT_CITIES, 0)
        .then(err => convert2DimArrayInto1Dim(err))
    logger.log('reloadArrCities done')
    return cities
}

export const getArrFromStock = (col: number): string[] => {
    let arr = arrStk.map(row => row[col - 1])
    logger.log('getArrFromStock by ' + col)
    return arr
}
