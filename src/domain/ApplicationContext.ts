class ApplicationContext {

    private _reload_stk_last_date: Date

    constructor() {
        this._reload_stk_last_date = new Date()
    }

    get reload_stk_last_date(): Date {
        return this._reload_stk_last_date
    }

    set reload_stk_last_date(value: Date) {
        this._reload_stk_last_date = value
    }

    toString(): string {
        return JSON.stringify({reload_stk_last_date: this.reload_stk_last_date})
    }
}

export const appCtx = new ApplicationContext()
