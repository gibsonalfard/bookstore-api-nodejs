const mysql = require("mysql")
const util = require('util')

class Mysql{
    defaultTimeout = 60*60*1000
    constructor() {
        this.pool = mysql.createPool({
            connectionLimit: 50,
            connectTimeout: this.defaultTimeout,
            acquireTimeout: this.defaultTimeout,
            timeout: this.defaultTimeout,
            host: process.env.MYSQL_HOST,
            port: process.env.MYSQL_PORT,
            user: process.env.MYSQL_USER,
            password: process.env.MYSQL_USER_PASSWORD,
            database: process.env.MYSQL_DB
        })

        this.promiseQuery = util.promisify(this.pool.query).bind(this.pool)
    }

    doQuery = async (query) => {
        try{
            return await this.promiseQuery(query)
        }catch (e){
            console.log(e)
        }
    }

    addData = async (query, data) => {
        try{
            return await this.promiseQuery(query, data)
        }catch (e){
            console.log(e)
        }
    }
}

module.exports = new Mysql()