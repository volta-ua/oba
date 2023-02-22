import GSheetConnector from "../GSheetConnector.js";
import GSheetTableDefinition from "../GSheetTableDefinition.js";

class TblImageScanner extends GSheetConnector{
    static _instance;

    constructor() {
        super(
            new GSheetTableDefinition(
                process.env.GOOGLE_SPREADSHEET_ID_IMG,
                [
                    {
                        shName: 'FILES',
                        ranges:
                            [
                                {
                                    colL: 1,
                                    rowHeader: 1,
                                    numRows: null,
                                    numCols: 2,
                                    indKey: 1,
                                    arrColNames: ['Articul', 'ID']
                                }
                            ]
                    }
                ]
            )
        )
    }

    static async createInstance() {
        if (this._instance) {
            console.log('TblImageScanner already existed')
            return this._instance
        }
        console.log('TblImageScanner is creating')
        const gsConn = new TblImageScanner()
        this._instance = await gsConn.create()
        return this._instance
    }

}

export default TblImageScanner
