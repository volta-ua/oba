class UserDto {
    chat_id: string
    phone?: string | undefined
    username?: string | undefined
    name?: string | undefined
    state?: string | undefined

    constructor(data: any) {
        this.chat_id = data.chat_id
        this.phone = data?.phone
        this.username = data?.username
        this.name = data?.name
        this.state = data?.state
    }
}

export default UserDto
