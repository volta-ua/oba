import {numberToLetter} from "../utils/service.js";

export default class GSheetTableDefinition {
    _id;
    _shName;
    _colL;
    _indKeyCol;
    _arrColNames;
    _rowHeader;

    constructor(id, shName, colL, indKeyCol, arrColNames, rowHeader) {
        this._id = id;
        this._shName = shName;
        this._colL = colL;
        this._indKeyCol = indKeyCol;
        this._arrColNames = arrColNames;
        this._rowHeader = rowHeader;
    }

    getRangeInA1Notation() {
        return numberToLetter(this._colL) + (this._rowHeader + 1) +
            ':' + numberToLetter(this._colL + this._arrColNames.length - 1);
    }

    get id() {
        return this._id;
    }

    get shName() {
        return this._shName;
    }

    get colL() {
        return this._colL;
    }

    get indKeyCol() {
        return this._indKeyCol;
    }

    get arrColNames() {
        return this._arrColNames;
    }

    get rowHeader() {
        return this._rowHeader;
    }
}
