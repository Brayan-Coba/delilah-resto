-- MySQL Script generated by MySQL Workbench
-- Tue Feb  2 20:18:54 2021
-- Model: New Model    Version: 1.0
-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=1;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=1;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

set FOREIGN_KEY_CHECKS = 1;
set UNIQUE_CHECKS = 1;

-- -----------------------------------------------------
-- Schema db_delilah_resto
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `db_delilah_resto` DEFAULT CHARACTER SET utf8 ;
USE `db_delilah_resto` ;

-- -----------------------------------------------------
-- Table `db_delilah_resto`.`Producto`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`Producto` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Nombre` VARCHAR(255) NOT NULL UNIQUE,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`GrupoPrecio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`GrupoPrecio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Grupo` VARCHAR(255) NOT NULL UNIQUE,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`Precio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`Precio` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `GrupoPrecio_id` INT NOT NULL,
  `Precio` DECIMAL(13,4) NOT NULL,
  `Fecha_ini` DATETIME NOT NULL,
  `Fecha_fin` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `Grupo_idx` (`GrupoPrecio_id` ASC) VISIBLE,
  CONSTRAINT `Grupo`
    FOREIGN KEY (`GrupoPrecio_id`)
    REFERENCES `db_delilah_resto`.`GrupoPrecio` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`Producto_Grupo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`Producto_Grupo` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Producto_id` INT NOT NULL,
  `GrupoPrecio_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Producto_Grupo_Producto1_idx` (`Producto_id` ASC) VISIBLE,
  UNIQUE INDEX `Producto_id_UNIQUE` (`Producto_id` ASC) VISIBLE,
  INDEX `fk_Producto_Grupo_GrupoPrecio1_idx` (`GrupoPrecio_id` ASC) VISIBLE,
  CONSTRAINT `fk_Producto_Grupo_Producto1`
    FOREIGN KEY (`Producto_id`)
    REFERENCES `db_delilah_resto`.`Producto` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Producto_Grupo_GrupoPrecio1`
    FOREIGN KEY (`GrupoPrecio_id`)
    REFERENCES `db_delilah_resto`.`GrupoPrecio` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`EstadoUsuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`EstadoUsuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `EstadoUsuario` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE INDEX `EstadoUsuario_UNIQUE` (`EstadoUsuario` ASC) VISIBLE)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_delilah_resto`.`TipoUsuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`TipoUsuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `TipoUsuario` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`Usuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`Usuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  #Usuario y contraseñas no deberian ser unicas y se deberia comprobar por funcion si esta activo o no pero no es necesario para la entrega y por tiempo no se implementa
  `Usuario` VARCHAR(255) NOT NULL UNIQUE,
  `Contraseña` VARCHAR(255) NOT NULL,
  `Correo` VARCHAR(255) NOT NULL UNIQUE,
  `EstadoUsuario_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Usuario_EstadoUsuario1_idx` (`EstadoUsuario_id` ASC) VISIBLE,
  CONSTRAINT `fk_Usuario_EstadoUsuario1`
    FOREIGN KEY (`EstadoUsuario_id`)
    REFERENCES `db_delilah_resto`.`EstadoUsuario` (`id`)
    #No se deberia borrar en cascada solo desactivar pero por tiempo de entrega se borra
    ON DELETE CASCADE
    ON UPDATE NO ACTION)
ENGINE = InnoDB;



-- -----------------------------------------------------
-- Table `db_delilah_resto`.`InfoUsuario`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`InfoUsuario` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Nombre_y_apellido` VARCHAR(255) NOT NULL,
  `Celular` VARCHAR(45) NOT NULL,
  `Direccion_de_envio` VARCHAR(255) NOT NULL,
  `Usuario_id` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_InfoUsuario_Usuario1_idx` (`Usuario_id` ASC) VISIBLE,
  CONSTRAINT `fk_InfoUsuario_Usuario1`
    FOREIGN KEY (`Usuario_id`)
    REFERENCES `db_delilah_resto`.`Usuario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`EstadoPedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`EstadoPedido` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `EstadoPedido` VARCHAR(45) NOT NULL,
  `EsFinal` ENUM("S", "N") NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`MetodosPago`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`MetodosPago` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `MetodosPago` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_delilah_resto`.`Pedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`Pedido` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `InfoUsuario` INT NOT NULL,
  `EstadoPedido` INT NOT NULL,
  `MetodosPago` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_Pedido_InfoUsuario1_idx` (`InfoUsuario` ASC) VISIBLE,
  INDEX `fk_Pedido_EstadoPedido1_idx` (`EstadoPedido` ASC) VISIBLE,
  INDEX `fk_Pedido_MetodosPago1_idx` (`MetodosPago` ASC) VISIBLE,
  CONSTRAINT `fk_Pedido_InfoUsuario1`
    FOREIGN KEY (`InfoUsuario`)
    REFERENCES `db_delilah_resto`.`InfoUsuario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Pedido_EstadoPedido1`
    FOREIGN KEY (`EstadoPedido`)
    REFERENCES `db_delilah_resto`.`EstadoPedido` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Pedido_MetodosPago1`
    FOREIGN KEY (`MetodosPago`)
    REFERENCES `db_delilah_resto`.`MetodosPago` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;

-- -----------------------------------------------------
-- Table `db_delilah_resto`.`DetallePedido`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`DetallePedido` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `Pedido_id` INT NOT NULL,
  `Producto` INT NOT NULL,
  `Cantidad` INT NOT NULL DEFAULT 1,
  `Precio` INT NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `fk_DetallePedido_Pedido1_id_idx` (`Pedido_id` ASC) VISIBLE,
  INDEX `fk_DetallePedido_Producto1_idx` (`Producto` ASC) VISIBLE,
  CONSTRAINT `fk_DetallePedido_Pedido1`
    FOREIGN KEY (`Pedido_id`)
    REFERENCES `db_delilah_resto`.`Pedido` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_DetallePedido_Producto1`
    FOREIGN KEY (`Producto`)
    REFERENCES `db_delilah_resto`.`Producto` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`Usuario_Tipo`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`Usuario_Tipo` (
  `Usuario_id` INT NOT NULL,
  `TipoUsuario_id` INT NOT NULL,
  INDEX `fk_Usuario_Tipo_Usuario1_idx` (`Usuario_id` ASC) VISIBLE,
  INDEX `fk_Usuario_Tipo_TipoUsuario1_idx` (`TipoUsuario_id` ASC) VISIBLE,
  UNIQUE INDEX `ux_usuario_tipo` (`Usuario_id` ASC, `TipoUsuario_id` ASC) VISIBLE,
  CONSTRAINT `fk_Usuario_Tipo_Usuario1`
    FOREIGN KEY (`Usuario_id`)
    REFERENCES `db_delilah_resto`.`Usuario` (`id`)
    ON DELETE CASCADE
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_Usuario_Tipo_TipoUsuario1`
    FOREIGN KEY (`TipoUsuario_id`)
    REFERENCES `db_delilah_resto`.`TipoUsuario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`Aplicaciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`Aplicaciones` (
  `idAplicaciones` INT NOT NULL AUTO_INCREMENT,
  `Aplicaciones` VARCHAR(255) NOT NULL,
  PRIMARY KEY (`idAplicaciones`),
  UNIQUE INDEX `Aplicaciones_UNIQUE` (`Aplicaciones` ASC) VISIBLE)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `db_delilah_resto`.`TipoUsuario_Aplicaciones`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `db_delilah_resto`.`TipoUsuario_Aplicaciones` (
  `TipoUsuario_id` INT NOT NULL,
  `Aplicaciones_idAplicaciones` INT NOT NULL,
  PRIMARY KEY (`TipoUsuario_id`, `Aplicaciones_idAplicaciones`),
  INDEX `fk_TipoUsuario_Aplicaciones_Aplicaciones1_idx` (`Aplicaciones_idAplicaciones` ASC) VISIBLE,
  INDEX `fk_TipoUsuario_Aplicaciones_TipoUsuario1_idx` (`TipoUsuario_id` ASC) VISIBLE,
  INDEX `ux_TipoUsuario_Aplicaciones` (`TipoUsuario_id` ASC, `Aplicaciones_idAplicaciones` ASC) VISIBLE,
  CONSTRAINT `fk_TipoUsuario_has_Aplicaciones_TipoUsuario1`
    FOREIGN KEY (`TipoUsuario_id`)
    REFERENCES `db_delilah_resto`.`TipoUsuario` (`id`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION,
  CONSTRAINT `fk_TipoUsuario_has_Aplicaciones_Aplicaciones1`
    FOREIGN KEY (`Aplicaciones_idAplicaciones`)
    REFERENCES `db_delilah_resto`.`Aplicaciones` (`idAplicaciones`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

insert into db_delilah_resto.EstadoUsuario values (1,"Activo");

insert into db_delilah_resto.EstadoUsuario values (2,"Inactivo");

INSERT INTO db_delilah_resto.TipoUsuario values (1,"admin");

INSERT INTO db_delilah_resto.TipoUsuario values (2,"client");

INSERT INTO db_delilah_resto.usuario (id,usuario,contraseña,correo,EstadoUsuario_id) values (1, "Brayan", "1234", "espisco@correo.com",1);

select * from usuario;

INSERT INTO db_delilah_resto.usuario (id,usuario,contraseña,correo,EstadoUsuario_id) values (2, "Ana", "1234", "espisca@correo.com",1);

insert into db_delilah_resto.Usuario_Tipo (Usuario_id,TipoUsuario_id) values (1,1);

insert into db_delilah_resto.Usuario_Tipo (Usuario_id,TipoUsuario_id) values (2,2);
/*
select * from db_delilah_resto.Usuario_Tipo where Usuario_id = 1 and TipoUsuario_id = 2;

select TipoUsuario_id from db_delilah_resto.Usuario_Tipo where Usuario_id = 1;

select * from db_delilah_resto.usuario where Usuario = "Cuatro" or Correo = null and Contraseña = "1234";

select contraseña from db_delilah_resto.usuario where Usuario = "Cuatro" or Correo = "cuatro@correo.com";

select contraseña from usuario where Usuario ="adasdadw";

select * from db_delilah_resto.estadousuario;
select * from db_delilah_resto.tipousuario;
select * from db_delilah_resto.usuario;
select * from db_delilah_resto.Usuario_Tipo;

select * from db_delilah_resto.producto;
select * from db_delilah_resto.grupoprecio;
select * from db_delilah_resto.producto_grupo;
select * from db_delilah_resto.precio;


select * from db_delilah_resto.usuario 
	join db_delilah_resto.Usuario_Tipo 
	on db_delilah_resto.usuario.id = db_delilah_resto.Usuario_Tipo.Usuario_id
	where TipoUsuario_id = 2 and (usuario = null or correo = "espisca@correo.com");
    
update db_delilah_resto.producto set Nombre = "Amborgesa" where id = 8;

delete from db_delilah_resto.Usuario_Tipo where Usuario_id = 13 and TipoUsuario_id = 1;

delete from db_delilah_resto.usuario where id =5;

select * from precio where id in (1,2);

select * from precio join grupoprecio on precio.GrupoPrecio_id = grupoprecio.id;

select Precio from precio 
	join producto_grupo
    on precio.GrupoPrecio_id = producto_grupo.GrupoPrecio_id
    where producto_grupo.producto_id in (1,2,3,6);
    
select id from grupoprecio where Grupo = "Helados";
insert into db_delilah_resto.producto values (1,"Papas");
insert into producto_grupo values (null,3,3);

delete from productos where id = 10;
insert into precio values (null,5,5000,now(),now());

select Nombre , Precio
	from precio
    join producto_grupo
    on precio.GrupoPrecio_id = producto_grupo.GrupoPrecio_id
	join producto
    on producto_grupo.Producto_id = producto.id
    where producto_grupo.producto_id in (1,2,3,4,5,6,7)
    order by producto.Nombre;
    
select id,TipoUsuario_id from usuario join Usuario_Tipo on usuario.id = Usuario_Tipo.Usuario_id where (usuario = "Uno" or correo = null or id = null);

select producto_grupo.id, Nombre, Grupo 
	from producto_grupo 
    join producto 
    on producto_grupo.Producto_id = producto.id
    join grupoprecio
    on producto_grupo.GrupoPrecio_id = grupoprecio.id;
    
select * from grupoprecio join precio on grupoprecio.id = precio.GrupoPrecio_id;
grupoprecio.id,Grupo,Precio

alter table db_delilah_resto.Usuario_Tipo add CONSTRAINT `fk_Usuario_Tipo_TipoUsuario1` FOREIGN KEY (`TipoUsuario_id`) REFERENCES `tipousuario` (`id`);


update grupoprecio set grupoprecio.Grupo = "Hielo" where id = 5;
update precio set precio.Precio = 500 where GrupoPrecio_id = 5;

update grupoprecio, precio 
	set grupoprecio.Grupo = "Hielo extra",  precio.Precio = 0 
    where grupoprecio.id = precio.GrupoPrecio_id and grupoprecio.id = 5;
    
select * from grupoprecio, precio where grupoprecio.id = precio.GrupoPrecio_id and grupoprecio.id = 5;
alter table infousuario change Telfono Celular varchar(45);
select EsFinal from pedido 
	join estadopedido 
    on pedido.EstadoPedido = estadopedido.id
    where pedido.id = 1;
    
    update EstadoPedido set EstadoPedido = "Creado" where id = 1;
    update pedido set EstadoPedido = 2 where id = 1;

select Max(id) from pedido;

select id from infousuario where Usuario_id = 3;
select id from metodospago where MetodosPago = "Efectivo";

select Max(id) as ejemplo from producto;
*/
