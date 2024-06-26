require('dotenv').config({path:'../.env'})
const {scrapper} = require('./js/scrapper')


const vars = {
    URL: process.env.URL,
    ENV: process.env.ENV,
    USER_RUT: process.env.USER_RUT,
    USER_CLAVE: process.env.USER_CLAVE,
    EMPRESA_RUT: process.env.EMPRESA_RUT,
    EMPRESA_NOMBRE: process.env.EMPRESA_NOMBRE,
    EMPRESA_ALIAS: (process.env.EMPRESA_ALIAS)?process.env.EMPRESA_ALIAS :process.env.EMPRESA_NOMBRE,
    EMPRESA_BANCO: process.env.EMPRESA_BANCO,
    EMPRESA_TIPOCTA: process.env.EMPRESA_TIPOCTA,
    EMPRESA_MAIL: process.env.EMPRESA_MAIL,
    EMPRESA_NROCTA: process.env.EMPRESA_NROCTA,
    DESTI_RUT: process.env.DESTI_RUT,
    DESTI_NOMBRE: process.env.DESTI_NOMBRE,
    DESTI_ALIAS: process.env.DESTI_ALIAS,
    DESTI_BANCO: process.env.DESTI_BANCO,
    DESTI_TIPOCTA: process.env.DESTI_TIPOCTA,
    DESTI_NROCTA: process.env.DESTI_NROCTA,
    DESTI_MAIL: process.env.DESTI_MAIL,
    DESTI_MONTO: process.env.DESTI_MONTO,
    DESTI_MENSAJES: process.env.DESTI_MENSAJES,
}

scrapper(vars).then(r => console.log(`Transferencia exitosa`)).catch(e => console.log(`hubo un error ${e.message}`))
