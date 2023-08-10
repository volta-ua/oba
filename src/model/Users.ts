import User from "./User";

class Users {
    _users: Set<User>

    constructor() {
        this._users = new Set<User>()
    }

    addUser(user: User): void {
        this._users.add(user)
    }

    getExistedOrAddNewUser(id: string): User {
        for (const user of this._users) {
            if (user.chatId === id) return user
        }
        const newUser = new User(id)
        this.addUser(newUser)
        return newUser
    }

    toString(): string {
        return this._users.toString()
    }
}

export const users = new Users()
