const jwt = require("jsonwebtoken");
var usuarios = require("./users")

// Load the MySQL connection
const conexion = require('../data/config');
const { obtenerEstadoUsuario } = require("./users");


function adminInicio (req,res){
    console.log(req.id)
    res.send("Hola admin")
}


async function autorizarRol(data){
    console.log(data)
    return new Promise (async (resolve,reject) => {
        var peticion_rol = "Admin"
        var rol = await usuarios.obtenerRol(peticion_rol)
        var peticion = "select id,TipoUsuario_id from usuario join Usuario_Tipo on usuario.id = Usuario_Tipo.Usuario_id where (usuario = ? or correo = ? or id = ?);"
        conexion.query(peticion,[data,data,data],(error,autorizacion) => {
            if (error){
                reject(error)
            }

            else if (autorizacion.length == 0){
               resolve(autorizacion)
            }

            else if (autorizacion[0].TipoUsuario_id == rol){
                var id = autorizacion[0].id
                var informacion = [true,id]
                resolve(informacion)
            }

            else {
                var id = autorizacion[0].id
                var informacion = [false,id]
                resolve(informacion)
            }
        })
    })
}

async function verificarAdmin(req,res){
  return new Promise ((resolve,reject) => {
    jwt.verify(req.token,"my secret token", async (err,data) => {
        try{
            var validacion = await autorizarRol(data)

            if (validacion[0] == true){
                resolve(validacion)
            }
            else if (validacion.length == 0){
                res.send("Token invalido")
            }
            else{
                resolve(validacion)
            }
        }
        catch{
            res.send(err)
        }
    })
  })  
}

async function pasarVerificacion (req,res,netx){
    var confirmacion = await verificarAdmin(req,res,netx)
    if (confirmacion[0] == true){
        req.id = confirmacion[1]
        netx()
    }
    else{
        res.status(403).send("Requiere permisos de administrador")
    }
}

async function verificarUser(req,res,next){
    var confirmacion = await verificarAdmin(req,res,next)
    req.id = confirmacion[1]
    next()
}


async function getUsuarios(req,res) {
    conexion.query("select * from usuario", function(error,results,fields){
        if(error) {
            throw error;
        }
        else {
            res.json(results)
        }
    })
}


function delUsuarios (req,res) {
    var id = req.params.id
    conexion.query("select id from usuario where id = ?", id, (error,result) =>{
        if (error){
            throw error
        }

        else if (result.length == 0){
            res.send("No existe el id " + id)
        }

        else {
            conexion.query("delete from usuario where id = ?", id, (error,result) =>{
                if (error){
                    throw error
                }
                res.send("Se ha borrado correctamente el user con id " + id)
            })
        }
    })
}

async function putUsuarios (req,res){
    var id, usuario, pre_contraseña, contraseña, correo, datos

    id = req.params.id
    usuario = req.body.usuario
    pre_contraseña = req.body.contraseña
    contraseña = await usuarios.encriptarContraseña(pre_contraseña,contraseña)
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
                res.send("se ha actualizado correctamente el usuario con id "+id)
            }) 
         }
    })
}

async function putRol (req,res){
    var id = req.params.id
    var peticion_rol = "Admin"
    var rol = await usuarios.obtenerRol(peticion_rol)

    conexion.query("insert into Usuario_Tipo(Usuario_id,TipoUsuario_id) values (?,?)",[id,rol],(error,actualizado) => {
        if (error){
            res.send("Error al actualizar rol "+error)
        }

        else{
            res.status(201).send("El usuario de id "+id+" se ha actualizado con el rol "+peticion_rol)
        }
    })
}

async function delRol(req,res){
    var id, peticion_rol, rol, validar_admin

    id = req.params.id
    peticion_rol = "Admin"
    rol = await usuarios.obtenerRol(peticion_rol)
    validar_admin = await autorizarRol(id)
    if (validar_admin == true){
        conexion.query("delete from Usuario_Tipo where Usuario_id = ? and TipoUsuario_id = ?",[id,rol],(error,borrado) => {
            if (error){
                res.send("Error al borrar el rol "+error)
            }
    
            else{
                res.status(201).send("El usuario de id "+id+" se le borro el rol "+peticion_rol)
            }
        })
    }

    else{
    res.status(404).send("El usuario de id "+id+" no tiene rol de "+peticion_rol)
    }
    
}

async function postGrupoPrecio(req,res){
    var grupoprecio = req.body.grupo

    conexion.query("insert into grupoprecio values (null,?)",grupoprecio,(err,result) => {
        if (err){
            res.send("Error al ingresar un grupo de precio")
        }

        else{
            res.send("Se ha agregado correctamente un grupo de precio "+grupoprecio)
        }
    })
}

async function getGrupoPrecio(req,res){
    conexion.query("select grupoprecio.id,Grupo,Precio from grupoprecio join precio on grupoprecio.id = precio.GrupoPrecio_id;",(err,result) => {
        if (err){
            res.send("Error al obtener grupo de precios "+err)
        }

        else {
            res.json(result)
        }
    })
}

async function obtenerIdGrupo(grupo){
    return new Promise ((resolve,reject) => {
        conexion.query("select id from grupoprecio where Grupo = ?",grupo,(err,result) => {
            if (err){
                reject (err)
            }

            else if (result.length == 0){
                resolve(result)
            }

            else {
                resolve(result[0].id)
            }
        })
    })
}

async function obtenerPrecio(req,res){
    return new Promise ((resolve,reject) => {
        var datos_peticion = "precio.id,precio.GrupoPrecio_id,precio.Precio,precio.Fecha_ini,precio.Fecha_fin,grupoprecio.Grupo"
        var peticion = "select "+datos_peticion+" from precio join grupoprecio where precio.GrupoPrecio_id = grupoprecio.id"

        conexion.query(peticion, (err,result) => {
            if (err){
                reject("Error al obtener precios "+err)
            }

            else {
                resolve(result)
            }
        })
    })
}

async function getPrecio (req,res){
    try{ 
        var precio = await obtenerPrecio()
        res.send(precio)
    }
    catch(error){
        res.send("se generado un error al buscar la lista de precios"+error)
    } 
}


async function postPrecio(req,res){
    var precio, grupo, id_grupo, fecha_ini, fecha_fin, datos, peticion

    precio = req.body.precio
    grupo = req.body.grupo
    /*se agregan fechas iniciales y finales con proposito de un cambio dinamico de precios pero al no ser esencial
    para la entrega y por cuestion de tiempo no se desarrolla mas de momento*/
    fecha_ini = new Date(req.body.fecha_ini)
    fecha_fin = new Date(req.body.fecha_fin)
    id_grupo = await obtenerIdGrupo(grupo)
    datos = [id_grupo,precio,fecha_ini,fecha_fin]
    peticion = "insert into precio (id,GrupoPrecio_id,Precio,Fecha_ini,Fecha_fin) values (null,?,?,?,?)"

    if (id_grupo.length == 0){
        res.send("No se encontro grupo "+grupo)
    }
    else{
        conexion.query(peticion,datos,(err,result)=>{
            if (err){
                res.send("Se he generado el siguiente error al ingresar precio "+err)
            }

            else {
                res.send("Se ha agregado correctamente el precio "+precio+" al grupo "+grupo)
            }
        })
    }
}

async function putPrecio(req,res){
    var precio, grupo, id_grupo, fecha_ini, fecha_fin, datos, peticion

    precio = req.body.precio
    grupo = req.body.grupo
    /*se agregan fechas iniciales y finales con proposito de un cambio dinamico de precios pero al no ser esencial
    para la entrega y por cuestion de tiempo no se desarrolla mas de momento*/
    fecha_ini = new Date(req.body.fecha_ini)
    fecha_fin = new Date(req.body.fecha_fin)
    id_grupo = await obtenerIdGrupo(grupo)
    datos = [precio,fecha_ini,fecha_fin,id_grupo]
    peticion = "update precio set Precio = ifnull (?,Precio), Fecha_ini = ifnull (?,Fecha_ini), Fecha_fin = ifnull (?,Fecha_fin) where GrupoPrecio_id = ?"

    if (id_grupo.length == 0){
        res.send("No se encontro grupo "+grupo)
    }
    else{
        conexion.query(peticion,datos,(err,result)=>{
            if (err){
                res.send("Se he generado el siguiente error al ingresar precio "+err)
            }

            else {
                res.send("Se ha agregado correctamente el precio "+precio+" al grupo "+grupo)
            }
        })
    }

}


async function postProducto_Grupo(req,res){
    var id_producto = req.body.id_producto
    var id_grupo = req.body.id_grupo

    conexion.query("insert into producto_grupo values (null,?,?)",[id_producto,id_grupo],(err,result) => {
        if (err){
            res.send("se genero el siguiente error al unir productos y grupos "+err)
        }

        else{
            res.send("Se ha agregados correctamente el producto de id "+id_producto+" con el grupo de id "+id_grupo)
        }
    })
}

async function getProducto_Grupo(req,res){
    var peticion = "select * from producto_grupo join producto on producto_grupo.Producto_id = producto.id join grupoprecio on producto_grupo.GrupoPrecio_id = grupoprecio.id;"
    conexion.query(peticion,(err,result) => {
        if (err){
            res.send("se genero el siguiente obtener los productos x grupos "+err)
        }

        else{
            res.send(result)
        }
    })
}


async function getMetodosPago(req,res){
    conexion.query("select * from metodospago ",(err,result) =>{
        if (err){
            res.send("Se genero el siguiente error al obtener los metodos de pago "+err)
        }

        else{
            res.send(result)
        }
    })
}


async function postMetodosPago(req,res){
    var metodo_pago = req.body.metodo_pago

    conexion.query("insert into metodospago (id,MetodosPago) values (null,?)",metodo_pago,(err,result) =>{
        if (err){
            res.send("Se genero el siguiente error al ingresar metodo de pago "+err)
        }

        else{
            res.send("Se ha agregado correctamente el metodo de pago "+metodo_pago)
        }
    })
}

async function getEstadosPedido(req,res){
    conexion.query("select * from estadopedido",(err,result) => {
        if(err){
        res.send("se genero el siguiente error al obtener los estados de pedido "+err)
        }

        else {
            res.send(result)
        }
    })

}

async function postEstadosPedido (req,res){
    var estadoPedido = req.body.estadoPedido
    var esFinal = req.body.esFinal

    conexion.query("insert into estadopedido values (null,?,?)",[estadoPedido,esFinal], (err,restult) => {
        if (err){
            res.send("Error al ingresar estado de pedidos "+err)
        }

        else{
            res.send("Se ha agregado correctamente el estado "+estadoPedido+" su estado final es "+esFinal)
        }
    })
}


async function getInfoUsuarios(req,res){
    conexion.query("select * from infousuario",(err,result) => {
        if (err){
            res.send("Se genero el siguiente error al consultar su informacion "+err)
        }

        else{
            res.send(result)
        }
    })
}

async function verificarEstadoFinal(id_pedido){
    return new Promise ((resolve,reject) => {  
        conexion.query("select EsFinal from pedido join estadopedido on pedido.EstadoPedido = estadopedido.id where pedido.id = ?",id_pedido,(err,result) => {
            if(err){
                reject("Se genero el siguiente error al confirmar estado final "+err)
            }

            else {
                resolve(result[0].EsFinal)
            }
        })
    })
}

async function putEstadoPedido(req,res){
    var estado_pedido = req.body.estado_pedido
    console.log(estado_pedido)
    var id_pedido = req.body.id_pedido

    var estado_final = await verificarEstadoFinal(id_pedido)
    if (estado_final == "S"){
        res.send("No se puede cambiar un pedido con estado finalizado")
    }
    else{
        conexion.query("update pedido set EstadoPedido = ? where id = ?",[estado_pedido,id_pedido],(err,result) =>{
            if (err){
                res.send("Se genero el siguiente error al actualizar el estado del pedido "+err)
            }
            else{
                res.send("Se ha actualziado correctamente el pedio "+id_pedido+" con el estado "+estado_pedido)
            }
        })
    }
}

module.exports = {
    adminInicio : adminInicio, 
    getUsuarios : getUsuarios, 
    delUsuarios : delUsuarios,
    putUsuarios : putUsuarios, 
    pasarVerificacion : pasarVerificacion,
    verificarUser : verificarUser, 
    autorizarRol : autorizarRol, 
    putRol : putRol, 
    delRol : delRol,
    postGrupoPrecio : postGrupoPrecio,
    getGrupoPrecio : getGrupoPrecio,
    getPrecio : getPrecio,
    postPrecio : postPrecio,
    putPrecio : putPrecio,
    postProducto_Grupo : postProducto_Grupo,
    getProducto_Grupo : getProducto_Grupo,
    getMetodosPago : getMetodosPago,
    postMetodosPago : postMetodosPago,
    getEstadosPedido : getEstadosPedido,
    postEstadosPedido : postEstadosPedido,
    getInfoUsuarios : getInfoUsuarios,
    putEstadoPedido : putEstadoPedido
}