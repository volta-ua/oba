export default class Item {
    _name: string | undefined
    private _size?: number | undefined
    private _qty?: number | undefined

    constructor(name: string) {
        this._name = name
    }

    get size(): number | undefined {
        return this._size;
    }

    set size(value: number | undefined) {
        this._size = value;
    }

    get qty(): number | undefined {
        return this._qty;
    }

    set qty(value: number | undefined) {
        this._qty = value;
    }
}
