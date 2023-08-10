import {DataSource} from 'typeorm'
import configMode from '../config/config'
import {User} from "../entity/User";

export const appDataSource = new DataSource({
    type: 'mysql',
    host: configMode.db.host,
    port: 3306,
    username: configMode.db.username,
    password: configMode.db.password,
    database: configMode.db.database,
    synchronize: true,
    logging: [
        'query',
        'error',
        'schema',
        'warn',
        'info',
        'log',
    ],
    entities: [User],
    subscribers: [],
    migrations: [],
})
