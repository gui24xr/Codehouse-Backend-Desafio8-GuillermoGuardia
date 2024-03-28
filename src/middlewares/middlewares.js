
//Este middleware lo utilizare para enviar a handlebars siempre los datos de sesion
//Y no tener que enviarlos plantilla por plantilla

import { CartsManager} from "../controllers/carts-manager-db.js";
const cartsManager = new CartsManager()

export async function addSessionData(req, res, next) {
   /* res.locals.variables = {
      variable1: 'valor1',
      variable2: 'valor2',
    };*/

    //Mediante esta variable se envian los datos de session de manera global a toda la app.
    res.locals.sessionData = req.session 
    
    //Esta linea es para calcular la cantidad de productos del carro del user con sesion iniciada y renderizarlo en el carrito en la barra de inicio de session
    if (req.session.login) {
      res.locals.productsQuantityInUserCart = await cartsManager.countProductsInCart(req.session.user.cart)
      //console.log('Cantidad: ', res.locals.productsQuantityInUserCart)
  }
  
    next();
  }
  
