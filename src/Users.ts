class Users {
    _users: Set<any>

    constructor() {
        this._users = new Set()
    }

    addUser(user: any) {
        this._users.add(user)
    }

    getUserByChatId(id: string) {
        for (const user of this._users) {
            if (user.chatId === id) return user
        }
        return null
    }
}

export const users = new Users()
