import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn} from 'typeorm'

@Entity({name: 'users'})
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @CreateDateColumn({name: 'created_at'})
    createdAt: Date

    @UpdateDateColumn({name: 'updated_at'})
    updatedAt: Date

    @Column('double')
    chat_id: number

    @Column('varchar', {nullable: true})
    phone: string | undefined

    @Column('varchar', {nullable: true})
    username: string | undefined

    @Column('varchar', {nullable: true})
    name: string | undefined

    @Column('varchar', {nullable: true})
    state: string | undefined
}
