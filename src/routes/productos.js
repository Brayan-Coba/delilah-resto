// Load the MySQL connection
const conexion = require('../data/config');

async function postProductos(req,res){
    var producto = req.body.producto

    conexion.query("insert into producto (id,Nombre) values (null,?)",producto,(err,result) => {
        if (err){
            res.status(501).send("se produce el siguiente error al ingresar producto "+err)
        }

        else{
            res.status(201).send("Se ingresa correctamente el producto "+producto)
        }
    })
}

async function obtenerProducto_Precio(){
    return new Promise ((resolve,reject) => {
        var peticion = "select producto.id as producto_id, precio.id as precio_id, Nombre, Precio from precio join producto_grupo on precio.GrupoPrecio_id = producto_grupo.GrupoPrecio_id join producto on producto_grupo.Producto_id = producto.id order by producto.Nombre"
        conexion.query(peticion,(err,result) =>{
            if (err){
                reject("se produce el siguiente error al buscar productos "+err)
            }

            else{
                resolve(result)
            }
        })
    })
}

async function getProductos(req,res){
    try{ 
        var productos_precio = await obtenerProducto_Precio()
        res.send(productos_precio)
    }
    catch(error){
        res.send("se generado un error al buscar productos"+error)
    } 
}

async function putProductosAdmin(req,res){
    var id = req.params.id
    var producto = req.body.producto

    conexion.query("update producto set Nombre = ? where id = ?;",[producto,id],(err,result) => {
        if (err){
            res.send("error al actualizar producto "+producto+" con el id "+id)
        }

        else{
            res.send("Se ha actulizado correctamente el producto "+producto+" con el id "+id)
        }
    })
}

async function delProductos(req,res){
    var id = req.params.id

    conexion.query("delete from producto where id = ?",id,(err,result) => {
        if(err){
            res.status(501).send("Se ha presentado el siguiente error al borrar el producto "+err)
        }

        else{
            res.send("Se ha borrado correctamente el producto")
        }
    })
}

module.exports = { 
    postProductos : postProductos,
    getProductos : getProductos, 
    putProductosAdmin : putProductosAdmin, 
    delProductos : delProductos,
    obtenerProducto_Precio : obtenerProducto_Precio
}