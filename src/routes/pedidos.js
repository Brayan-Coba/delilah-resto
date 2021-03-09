const productos = require("./productos");

// Load the MySQL connection
const conexion = require('../data/config');

async function obtenerPrecioPedidos(req,res){
    var ids, cantidad_peticiones, peticion
    ids = req.body.id_pedidos
    cantidad_peticiones = []

    for (i = 0; i < ids.length; i++){
        cantidad_peticiones.push("?")
    }
    peticion = "select Nombre, Precio from precio join producto_grupo on precio.GrupoPrecio_id = producto_grupo.GrupoPrecio_id join producto on producto_grupo.Producto_id = producto.id where producto_grupo.producto_id in ("+cantidad_peticiones+") order by producto.Nombre"
    
    conexion.query(peticion,ids,(err,result) => {
        if (err){
            res.send(err)
        }

        else{
            var lista = []
            var precio = 0
            result.forEach(element => {
                lista.push(element.Nombre)
                precio = precio + element.Precio
            });
            console.log(req.id)
            res.send("Se ha generado un pedido de "+lista+" con un total de "+precio)
        }
    })
}

async function obtenerIdPrecio(ped_id){
     return new Promise ((resolve,reject) => {
        conexion.query("select precio.id from precio join producto_grupo on precio.GrupoPrecio_id = producto_grupo.GrupoPrecio_id join producto on producto_grupo.Producto_id = producto.id where producto.id = ?",ped_id,(err,result) =>{
            if (err){
                reject(err)
            }
            else{
                resolve(result)
            }
        })
    })
}


async function facturaPedido(info_productos,id_pedido,pedido,lista,precio,id_precio){
    for (i = 0; i<pedido.length;i++){
        if (pedido[i].metodo_de_pago == undefined){
            var ped_id, ped_cant, info_ped,nombre_producto, precio_producto, peticion,info_precio, id_precio
            ped_id = pedido[i].producto
            ped_cant = pedido[i].cantidad
            info_ped = info_productos.find(x => x.producto_id == ped_id)
            nombre_producto = info_ped.Nombre
            precio_producto = info_ped.Precio
            info_precio = await obtenerIdPrecio(ped_id)
        
            id_precio = info_precio[0].id

            lista.push(" "+nombre_producto+" x "+ped_cant)
            precio = precio + (precio_producto * ped_cant)
            peticion = "insert into detallepedido (id,Pedido_id,Producto,Cantidad,Precio) values (null,?,?,?,?)"

            conexion.query(peticion,[id_pedido,ped_id,ped_cant,id_precio],(err,result) => {
                if (err){
                    return
                }
            })
        }
    }
    console.log(precio)
    return precio
}

async function obtenerInfoUsuarioId(id){
    return new Promise ((resolve,reject) => {
        conexion.query("select id from infousuario where Usuario_id = ?",id,(err,result) => {
            if(err){
                reject("Error al obtener el id de infousuario "+err)
            }

            else if (result.length == 0){
                resolve(result)
            }

            else{
                resolve(result[0].id)
            }
        })
    })
}

async function obtenerEstadoPedido(estado_pedido){
    return new Promise ((resolve,reject) => {
        conexion.query("select id from estadopedido where EstadoPedido = ?",estado_pedido,(err,result) =>{
            if (err){
                reject("fallo al seleccionar estadopedido "+err)
            }

            else{
                resolve(result[0].id)
            }
        })
    })
}

async function postPedido(req,res){
    var info_productos, id, id_pedido, pedido, id_estado_pedido, info_metodo, metodo_pago, lista, precio, id_precio, total, infoUsuario_id, peticion
    const estado_pedido = "Creado"
    info_productos = await productos.obtenerProducto_Precio()
    id = req.id
    pedido = req.body
    lista = []
    precio = 0
    infoUsuario_id = await obtenerInfoUsuarioId(id)
    if (infoUsuario_id.length == 0){
        res.send("Informacion de usuario no encontrada")
    }
    else{
        id_estado_pedido = await obtenerEstadoPedido(estado_pedido)
        info_metodo = pedido.find(x => x.metodo_de_pago)
        metodo_pago = info_metodo.metodo_de_pago
    
        if (infoUsuario_id.length == 0){
            res.send("Informacion de Usuario no encontrada")
        }
    
        else{
            peticion = "insert into pedido (id, InfoUsuario, EstadoPedido, MetodosPago) values (null,?,?,?)"
            datos = [infoUsuario_id,id_estado_pedido,metodo_pago]
            conexion.query(peticion,datos, async (err,result) => {
                if (err){
                    res.send("Error al ingresar el pedido +"+err)
                }
                else{
                    id_pedido = result.insertId
                    if (id_pedido.length == 0){
                        res.send("No se encontro pedido")
                    }
                    console.log(id_pedido)
                    total = await facturaPedido(info_productos,id_pedido,pedido,lista,precio,id_precio)
                    console.log(total)
                    res.send("Se ha generado un pedido de "+lista+" con un total de "+total)
                }
            })
        }
    }
  
}

module.exports = {
    obtenerPrecioPedidos : obtenerPrecioPedidos,
    facturaPedido : facturaPedido,
    postPedido : postPedido
}