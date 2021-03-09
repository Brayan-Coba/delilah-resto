const express = require("express");
const app = express();
const morgan = require("morgan");
const swaggerJsDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const usuarios = require("./routes/users");
const inicio = require("./routes/index");
const login = require("./routes/login");
const admin = require("./routes/admin");
const productos = require("./routes/productos");
const pedidos = require("./routes/pedidos");
const { verificarUser } = require("./routes/admin");


//settings
app.set("port", process.env.PORT || 3000);
app.set("json spaces", 2);
/*
const swaggerOptions = {
    swaggerDefinition: {
        info: {
            title: "delilah_Resto_Api",
            description: "API para un restaurante",
            contact: {
                name: "Brayan Coba Cruz"
            },
            servers: ["http://localhost:3000"]
        }
    },
    // [".routes/*.js"]
    apis: ["app.js"]
}

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));*/

//middlewares
app.use(morgan("dev"));
app.use(express.urlencoded({extended : false}));
app.use(express.json());

//routes
app.get("/", inicio.getInicio);

app.post("/users", usuarios.postUsuarios);
app.put("/users",login.autorizarToken,admin.verificarUser,usuarios.putUsuario)
app.get("/login", login.getLogin);
app.post("/login", login.postLogin);

app.get("/admin/users", login.autorizarToken,admin.pasarVerificacion,admin.getUsuarios);
app.delete("/admin/users/:id", login.autorizarToken,admin.pasarVerificacion,admin.delUsuarios);

app.get("/admin",login.autorizarToken,admin.pasarVerificacion,admin.adminInicio)

app.put("/admin/users/:id",login.autorizarToken,admin.pasarVerificacion,admin.putUsuarios);
app.delete("/admin/:id",login.autorizarToken,admin.pasarVerificacion,admin.delRol)
app.put("/admin/:id",login.autorizarToken,admin.pasarVerificacion,admin.putRol)

app.get("/productos",login.autorizarToken, productos.getProductos)
app.post("/admin/productos", login.autorizarToken,admin.pasarVerificacion,productos.postProductos)
app.delete("/admin/productos/:id", login.autorizarToken,admin.pasarVerificacion,productos.delProductos)
app.put("/admin/productos/:id",login.autorizarToken,admin.pasarVerificacion,productos.putProductosAdmin)

app.post("/admin/grupoprecio", login.autorizarToken,admin.pasarVerificacion,admin.postGrupoPrecio)
app.get("/admin/grupoprecio", login.autorizarToken,admin.pasarVerificacion,admin.getGrupoPrecio)

app.get("/admin/precio", login.autorizarToken,admin.pasarVerificacion,admin.getPrecio)
app.post("/admin/precio", login.autorizarToken,admin.pasarVerificacion,admin.postPrecio)
app.put("/adm/precio", login.autorizarToken,admin.pasarVerificacion,admin.putPrecio)

app.get("/pedidos", login.autorizarToken,admin.verificarUser,pedidos.obtenerPrecioPedidos)

app.get("/admin/producto_grupo", login.autorizarToken,admin.pasarVerificacion,admin.getProducto_Grupo)
app.post("/admin/producto_grupo", login.autorizarToken,admin.pasarVerificacion,admin.postProducto_Grupo)

app.get("/metodopago",admin.getMetodosPago)
app.post("/admin/metodopago",login.autorizarToken,admin.pasarVerificacion,admin.postMetodosPago)

app.get("/admin/estadopedido", login.autorizarToken,admin.pasarVerificacion,admin.getEstadosPedido)
app.post("/admin/estadopedido", login.autorizarToken,admin.pasarVerificacion,admin.postEstadosPedido)
app.put("/adm/estadopedido", login.autorizarToken,admin.pasarVerificacion,admin.putEstadoPedido)

app.get("/admin/infousuarios", login.autorizarToken,admin.pasarVerificacion,admin.getInfoUsuarios)

app.post("/pedido", login.autorizarToken,admin.verificarUser,pedidos.postPedido)

app.get("/infouser", login.autorizarToken,admin.verificarUser,usuarios.getInfoUsuario)
app.post("/infouser", login.autorizarToken,admin.verificarUser,usuarios.postInfoUsuario)




//starting the server
app.listen(app.get("port"), () => {
    console.log("Server on port "+app.get("port"))
})