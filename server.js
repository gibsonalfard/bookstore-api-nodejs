const Hapi = require('@hapi/hapi')
const routes = require('./src/routes')

const init = async () => {
    const server = Hapi.server({
        port: 5000,
        host: process.env.NODE_ENV !== 'production' ? 'localhost' : '0.0.0.0',
        routes: {
            cors:{
                origin: ["*"]
            }
        }
    })

    server.route(routes)

    let envVar = {
        host: process.env.MYSQL_HOST,
        port: process.env.MYSQL_PORT,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_USER_PASSWORD,
        database: process.env.MYSQL_DB
    }

    console.log(envVar)

    await server.start()
    console.log(`Server running at ${server.info.uri}`)
}

init()
