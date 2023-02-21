import {GoogleSpreadsheet} from 'google-spreadsheet'
import {numberToLetter} from "../utils/service.js";

export default class GSheetConnector {
    _table;
    _useCacheDuringMs;
    _doc;
    _sheet;
    _usedAt;

    constructor(table, useCacheDuringMs = 0) {
        this._table = table;
        this._useCacheDuringMs = useCacheDuringMs;
    }

    async create() {
        this._doc = new GoogleSpreadsheet(this._table.id);
        await this._doc.useServiceAccountAuth({
            client_email: (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL ?? ''),
            private_key: (process.env.GOOGLE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n')
        });
        await this._doc.loadInfo();
        this._sheet = this._doc.sheetsByTitle[this._table.shName];
    }

    async reloadInfo() {
        await this._doc.loadInfo()
            .then(() => console.log('reloadInfo done'))
    }

    async getData() {
        let arrData=[[]]
        arrData = await this._sheet.getCellsInRange(this._table.getRangeInA1Notation());
        return arrData;
    }

    async append(tuple) {
        const arrData = await this.getData();
        const newRow = arrData.length + 1;
        await this._sheet.loadCells(
            numberToLetter(this._table.colL) + newRow + ':' +
            numberToLetter(this._table.colL + this._table.arrColNames.length) + newRow);
        for (const val of tuple) {
            const i = tuple.indexOf(val);
            const cell = await this._sheet.getCell(0, i)
            cell.value = val;
        }
        await this._sheet.saveUpdatedCells();
    }

    async extractDataFromTableOrCache(isForce) {
        const dtNow = new Date()
        if (isForce || dtNow.getTime() - this._usedAt.getTime() > this._useCacheDuringMs) {
            await this.reloadInfo();
            this._usedAt = dtNow;
            //console.log('extractDataFromTableOrCache done')
        }
    }
}
