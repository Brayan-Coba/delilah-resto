const bcrypt = require("bcrypt");

// Load the MySQL connection
const conexion = require('../data/config');


async function encriptarContraseña(pre_contraseña,contraseña){
    return new Promise (resolve => {
        bcrypt.genSalt(10).then(salts => {
            bcrypt.hash(pre_contraseña,salts).then(hash => {
                contraseña = hash
                resolve(contraseña)
            })
        })
    })
}

async function obtenerEstadoUsuario(peticion_estadoUsuario) {
    return new Promise ((resolve,reject) => {
        conexion.query("select id from estadousuario where EstadoUsuario = ?",peticion_estadoUsuario,(error,id_EstadoUsuario) => {
            if (error){
                reject (error)
            }
            else {
                resolve(id_EstadoUsuario[0].id)
            }
        })
    })
}

/* Funcion para verificar si un usuario esta activo, no es fundamental para la entrega asi que queda pendiente
async function verficarEstadoUsuario (){
    var peticion_estadoUsuario = "Activo"
    var estadoUsuario = await obtenerEstadoUsuario(peticion_estadoUsuario)

    conexion.query("select EstadoUsuario_id from usuario where id = ?")
}
*/


async function obtenerRol(peticion_rol) {
    return new Promise ((resolve,reject) => {
        conexion.query("select id from tipousuario where TipoUsuario = ?",peticion_rol,(error,id_rol) => {
            if (error){
                reject (error)
            }
            else {
                resolve(id_rol[0].id)
            }
        })
    })
}


async function postUsuarios (req,res) {
    var usuario, pre_contraseña, contraseña, correo, datos, rol, estadoUsuario, peticion, petTipoUsuario
    
    const peticion_rol = "client"
    const peticion_estadoUsuario = "Activo"

    usuario = req.body.usuario
    pre_contraseña = req.body.contraseña
    contraseña = await encriptarContraseña(pre_contraseña,contraseña)
    correo = req.body.correo
    rol = await obtenerRol(peticion_rol)
    estadoUsuario = await obtenerEstadoUsuario(peticion_estadoUsuario)
    datos = [usuario, contraseña, correo, estadoUsuario]
    peticion = "insert into usuario (id,usuario,contraseña,correo,EstadoUsuario_id) values (null,?,?,?,?)"
    petTipoUsuario = "insert into Usuario_Tipo (Usuario_id,TipoUsuario_id) values (?,?)"

    if (usuario && contraseña && correo){
        conexion.query( peticion, datos , (error, result) => {
            if (error){
                var objErr = {errrorCode: error.errno , errorMessage : error.message}
                return res.status(501).send(objErr)
            }
            conexion.query(petTipoUsuario,[result.insertId,rol], (err,res) =>{
                if (err){
                    res.status(500).send("error al ingresar el tipo de usuario")
                    return
                }
            })
            res.status(201).send("Usuario añadido con id " + result.insertId);
        })
    }

    else {
        if (usuario == undefined){
            res.send("Error falta usuario")
        }

        else if (contraseña == undefined){
            res.send("Error falta contraseña")
        }

        else if (correo == undefined){
            res.send("Error falta correo")
        }

        else{
            res.send("Error el JSON puede estar mal estructurado")
        }
    }
}

async function putUsuario (req,res){
    var id, usuario, pre_contraseña, contraseña, correo, datos

    id = req.id
    usuario = req.body.usuario
    pre_contraseña = req.body.contraseña
    contraseña = await encriptarContraseña(pre_contraseña,contraseña)
    correo = req.body.correo
    datos = [usuario, contraseña, correo, id]



    conexion.query("select id from usuario where id = ?", id, (error,result) =>{
        if (error){
            throw error
        }
        else if (result.length == 0){
            res.send("No existe el id " + id)
        }
        else {
            var peticion = "update usuario set usuario = ifnull (?,usuario), contraseña = ifnull (?,contraseña), correo = ifnull (?,correo) where id = ?"
            conexion.query(peticion, datos, (error,result) => {
                if (error){
                    throw error
                }
                res.send("se ha actualizado correctamente su usuario")
            }) 
         }
    })
}

async function getInfoUsuario(req,res){
    var id = req.id

    conexion.query("select * from infousuario where Usuario_id = ?",id,(err,result) => {
        if (err){
            res.send("Se genero el siguiente error al consultar su informacion "+err)
        }

        else{
            res.send(result)
        }
    })
}

async function postInfoUsuario(req,res){
    var usuario_id, nombre, celular, direccion, peticion

    nombre = req.body.Nombre
    celular = req.body.Celular
    direccion = req.body.Direccion
    usuario_id = req.id

    peticion = "insert into infousuario (id,Nombre_y_apellido,Celular,Direccion_de_envio,Usuario_id) values (null,?,?,?,?)"

    conexion.query(peticion,[nombre,celular,direccion,usuario_id],(err,result) => {
        if (err){
            res.send("Se genero un error al ingresar informacion de usuario "+err)
        }

        else{
            res.send("Se ha agregado su informacion correctamente")
        }
    })
}

module.exports = { 
    postUsuarios : postUsuarios, 
    encriptarContraseña : encriptarContraseña, 
    obtenerRol : obtenerRol, 
    obtenerEstadoUsuario : obtenerEstadoUsuario,
    putUsuario : putUsuario,
    postInfoUsuario : postInfoUsuario,
    getInfoUsuario : getInfoUsuario
}