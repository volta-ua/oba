import GSheetConnector from "../GSheetConnector"
import GSheetTableDefinition from "../GSheetTableDefinition"
import {SH_DICT, SH_STK} from "../../config/constants"

class TblBooking extends GSheetConnector {
    static _instance: TblBooking;

    constructor() {
        super(
            new GSheetTableDefinition(
                process.env.GOOGLE_SPREADSHEET_ID ?? '',
                [
                    {
                        shName: SH_DICT,
                        ranges:
                            [
                                {
                                    colL: null,
                                    rowHeader: null,
                                    numRows: null,
                                    numCols: null,
                                    indKey: null,
                                    arrColNames: ['', '']
                                }
                            ]
                    },
                    {
                        shName: SH_STK,
                        ranges:
                            [
                                {
                                    colL: null,
                                    rowHeader: null,
                                    numRows: null,
                                    numCols: null,
                                    indKey: null,
                                    arrColNames: ['', '']
                                }
                            ]
                    }
                ]
            )
        )
    }

    static async createInstance() {
        if (this._instance) {
            console.log('TblBooking already existed')
            return this._instance
        }
        console.log('TblBooking is creating')
        const gsConn = new TblBooking()
        this._instance = await gsConn.create()
        return this._instance
    }

}

export default TblBooking
