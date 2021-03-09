const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken")

// Load the MySQL connection
const conexion = require('../data/config');

async function validarContraseña (pre_contraseña,db_contraseña){
    return new Promise ((resolve,reject) => {
        bcrypt.compare(pre_contraseña,db_contraseña, function (err,valido){
            if (err){
               reject(err)
            }
            else{
                resolve(valido)
            }
        })
    })
}

async function obtenerContraseñaDB (usuario,correo){
    return new Promise ((resolve,reject) => {
        conexion.query("select contraseña from usuario where (Usuario = ? or Correo = ?)",[usuario,correo], (error,result) => {
            if (error){
                reject(error)
            }
            else if (result.length == 0){
                resolve(".")
            }
            else{
                var db_contraseña =  result[0].contraseña
                resolve(db_contraseña)
            }
        })
    })
}

async function getLogin (req,res){
    res.send("Simulacion de pagina de login")
}

async function postLogin (req,res) {
    var usuario, pre_contraseña, db_contraseña, correo, validacion

    usuario = req.body.usuario
    correo = req.body.correo
    pre_contraseña = req.body.contraseña

    try{
        db_contraseña = await obtenerContraseñaDB(usuario,correo)
        validacion = await validarContraseña(pre_contraseña,db_contraseña)

        if (validacion == false){
            res.status(401).send("Credenciales no validas")
        }
        else if (usuario == undefined) {
            var token = jwt.sign(correo,"my secret token")
            res.json({token : token})
        }
        else {
            var token = jwt.sign(usuario,"my secret token")
            res.json({token : token})
        }
    }
    catch{
        res.status(500).send("Internal server error")
    } 
}


function autorizarToken (req,res,next){
    const bearerHeader = req.headers["authorization"]
        
    if (bearerHeader !== undefined){
        const bearer = bearerHeader.split(" ");
        const bearerToken = bearer[1]
        req.token = bearerToken
        next()
    }
    else{
        res.redirect("/login")
    }
}


module.exports = {
    postLogin : postLogin, 
    autorizarToken : autorizarToken,
    getLogin : getLogin
}