import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm'
import {states} from "../domain/states"
import Order from "../model/Order"

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date

    @Column('varchar')
    chat_id: string

    @Column('varchar', {nullable: true})
    phone: string | undefined

    @Column('varchar', {nullable: true})
    username: string | undefined

    @Column('varchar', {nullable: true})
    name: string | undefined

    @Column('varchar', {default: states.NEW})
    state: string | undefined

    @Column('decimal', {nullable: true})
    balance: number | undefined

    @Column('json', {nullable: true})
    bucket: Order | undefined
}
