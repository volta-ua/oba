import GSheetConnector from "../GSheetConnector.js";
import GSheetTableDefinition from "../GSheetTableDefinition.js";

class TblBotManager extends GSheetConnector{
    static _instance;

    constructor() {
        super(
            new GSheetTableDefinition(
                process.env.GOOGLE_SPREADSHEET_ID_BOT,
                [
                    {
                        shName: 'USERS',
                        ranges:
                            [
                                {
                                    colL: 2,
                                    rowHeader: 1,
                                    numRows: null,
                                    numCols: 2,
                                    indKey: 1,
                                    arrColNames: ['Chat ID', 'Username']
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
        console.log('TblBotManager is creating')
        const gsConn = new TblBotManager()
        this._instance = await gsConn.create()
        return this._instance
    }

}

export default TblBotManager
