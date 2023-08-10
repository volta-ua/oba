import GSheetConnector from "../GSheetConnector"
import GSheetTableDefinition from "../GSheetTableDefinition"
import {SH_DICT, SH_STK} from "../../config/constants"
import logger from "../../utils/logger";

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
            logger.log('TblBooking already existed')
            return this._instance
        }
        logger.log('TblBooking is creating')
        const gsConn = new TblBooking()
        this._instance = await gsConn.create()
        return this._instance
    }

}

export default TblBooking
