import Order from "./Order";
import Item from "./Item";

export default class User {
    private readonly _chatId: string
    private _orders: Order[]
    private _state?: string | undefined
    private _order?: Order
    private _lastItem?: Item | undefined

    constructor(chatId: string) {
        this._chatId = chatId
        this._orders = []
    }

    get chatId(): string {
        return this._chatId
    }

    get state(): string {
        return <string>this._state
    }

    set state(value: string) {
        this._state = value
    }

    get order(): Order {
        return <Order>this._order
    }

    set order(value: Order) {
        this._order = value
    }

    set orders(orders: Order[]) {
        this._orders = orders
    }

    get orders() {
        return this._orders
    }

    get lastItem(): Item | undefined {
        return this._lastItem
    }

    set lastItem(item: Item | undefined) {
        this._lastItem = item
    }
}
