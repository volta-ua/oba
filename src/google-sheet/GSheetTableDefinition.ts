/**
 *     [
 *      {
 *          shName,
 *          ranges: [
 *              {
 *                  colL,
 *                  rowHeader,
 *                  numRows,
 *                  numCols,
 *                  indKey,
 *                  arrColNames
 *              }
 *          ]
 *      }
 *     ]
 */


export default class GSheetTableDefinition {
    _id;
    _scheme;

    constructor(id: string, scheme: any[]) {//shName, colL, indKeyCol, arrColNames, rowHeader) {
        this._id = id;
        if (!Array.isArray(scheme)) throw new Error('Invalid schema')
        this._scheme = scheme;
    }

    /*_composeLayout(arrColNames) {
        const layout = {}
        arrColNames.forEach(
            (el, i) => layout[el] = i
        )
        return layout
    }*/

    /*getA1AddressOfDataSource() {
        return numberToLetter(this._colL) + (this._rowHeader + 1) +
            ':' + numberToLetter(this._colL + this._arrColNames.length - 1);
    }*/

    get id() {
        return this._id;
    }

    get scheme() {
        return this._scheme;
    }

}
