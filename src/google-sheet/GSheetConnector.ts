import {GoogleSpreadsheet} from 'google-spreadsheet'
import GSheetTableDefinition from "./GSheetTableDefinition";
import logger from "../utils/logger";

export default class GSheetConnector {
    _ws: any;
    _tableDef: GSheetTableDefinition;
    _doc: GoogleSpreadsheet;

    constructor(tableDef: GSheetTableDefinition) {
        this._tableDef = tableDef
    }

    async create() {
        this._doc = new GoogleSpreadsheet(this._tableDef.id)
        await this._doc.useServiceAccountAuth({
            client_email: (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? ''),
            private_key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
        })
        await this.reloadInfo()
        this._ws = {}
        for (const shDef of this._tableDef.scheme) {
            let shName = shDef['shName']
            Object.defineProperty(this._ws, shName, {
                value: await this._doc.sheetsByTitle[shName],
                writable: false,
                enumerable: true
            })
            Object.defineProperty(this._ws[shName], 'ranges', {
                value: [],
                writable: false
            })
            shDef.ranges.forEach(
                (rng: any) =>
                    this._ws[shName]['ranges'].push(
                        rng
                    )
            )
        }
        logger.log('created: ' + JSON.stringify(this._tableDef))
        return this
    }

    async reloadInfo() {
        await this._doc.loadInfo()
        logger.log('reloadInfo: ' + this._tableDef.id)
    }

    async getDataRangeBySheet(shName: string, addr: string, indKeyEmptyRevove?: number) {
        const sh = this._ws[shName]
        let data = await sh.getCellsInRange(addr)
        if (indKeyEmptyRevove) data = data.filter((el: string[]) => el[indKeyEmptyRevove] !== '')
        return data
    }

    /*_toString() {
        let msg = ''
        for (const [key, value] of Object.entries(this._ws)) {
            let delim = msg ? ', ' : ''
            msg += delim + key + ': ' + JSON.stringify(value)
        }
        return msg
    }*/

    get tableDef() {
        return this._tableDef;
    }

    /*async getData() {
        const arrData = await this._sheet.getCellsInRange(this._tableDef.getA1AddressOfDataSource());
        return arrData;
    }

    async getDataByRange(rngA1) {
        const arrData = await this._sheet.getCellsInRange(rngA1);
        return arrData;
    }

    async append(tuple) {
        const arrData = await this.getData();
        const newRow = arrData.length + 1;
        await this._sheet.loadCells(
            numberToLetter(this._tableDef.colL) + newRow + ':' +
            numberToLetter(this._tableDef.colL + this._tableDef.arrColNames.length) + newRow);
        for (const val of tuple) {
            const i = tuple.indexOf(val);
            const cell = await this._sheet.getCell(0, i)
            cell.value = val;
        }
        await this._sheet.saveUpdatedCells();
    }

    async reloadDataWhenCacheTimeoutExceeded(isForce) {
        const dtNow = new Date()
        if (isForce || dtNow.getTime() - this._usedAt.getTime() > this._useCacheDuringMs) {
            await this.reloadInfo();
            this._usedAt = dtNow;
            logger.log('extractDataFromTableOrCache done')
        }
    }*/
}
