/* 1- creamos un archivo passport.config.js en la carpeta config. */

/*2- instamos passport y el paquete de la estrategia elegida en este caso passport local. 
        npm i passport passport-local  
        
    y ahora  importamos ambos modulos en el archivo config JS.
    const passport = require("passport");    o import passport from 'passport'
    const local = require("passport-local");  o import local from "passport-local"

*/
import passport from "passport"
import local from "passport-local"
import GitHubStrategy from "passport-github2"

/*3- Traemos lo necesario de la BD (En este caso) UserModel y las funciones de bcrypt para encriptar lo que queremos encriptar. */ 

import { UserModel } from '../models/user.models.js'
import { createHash, isValidPassword } from '../utils/hashbcryp.js'
//Para crear y asignar un carro al nuevo usuario
import { CartsManager } from "../controllers/carts-manager-db.js"

const cartsManager = new CartsManager()

/*4- Creamos una instancia de local.Strategy. LocalStrategy es una clase como la de los modelos de mongo*/
const LocalStrategy = local.Strategy

/*5- Y ahora creamos y exportamos una funcion que inicialice todo esto igual que tenemos con las otras config.*/
export function initializePassport(){

    //passport.use lleva 3 parametros
    //1- nombree de ka estrategia , en este caso register
    //2- new LocalStrategy({passReqToCallback: true,usernameField: "email"} instancia de LocalStrategy con esa configuracion
    //  usernameField: "email" esta diciendo que el campo equivalente a username es el campo email
    //3- Un callback con el proceso que usamos para el registro. En este caso es lo quet terniamos antes en el endpoint de register.
    //4- avewriguar el tema de done
    passport.use("register", new LocalStrategy({passReqToCallback: true,usernameField: "email"}, async (req, username, password, done) => {
        const {first_name, last_name, email, age, role} = req.body;
        try {
            //Verificamos si ya existe un registro con ese mail
            let user = await UserModel.findOne({email:email});
            if(user) return done(null, false);
            //Si no existe, voy a crear un registro nuevo: 
            let newUser = {
                first_name,
                last_name,
                email,
                age,
                password: createHash(password),
                role,
                //cart: //await cartsManager.createCart()._id
            }

            const newCart = await cartsManager.createCart()
            let result = await UserModel.create({...newUser, cart: newCart });
            //Si todo resulta bien, podemos mandar done con el usuario generado. 
            return done(null, result);
        } catch (error) {
            return done(error);
        }
    }
    ))

    //Agregamos otra estrategia, ahora para el "login":
    passport.use("login", new LocalStrategy({usernameField: "email"}, async (email, password, done) => {
        try {
            //Primero verifico si existe un usuario con ese email:
            const user = await UserModel.findOne({email});
            if(!user) {
                console.log("Este usuario no existeeeeeee ahhh");
                return done(null, false);
            }
            //Si existe, verifico la contraseña: 
            if(!isValidPassword(password, user.password)) return done(null, false);
            return done(null, user);
        } catch (error) {
            return done(error);
        }
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id);
    });

    passport.deserializeUser(async (id, done) => {
        let user = await UserModel.findById({_id:id});
        done(null, user);
    })




    //*PARA GITHUB******************************************/
    passport.use("github",new GitHubStrategy({
        clientID: 'Iv1.1df2eaa08b41c7eb', 
        clientSecret: '48be7bb869f051d8d0d55541356c7111815fcdd7',
        callbackURL: "http://localhost:8080/githubcallback",//url a la que dirijo si me dan autorizacion
        },
      async(accessToken, refreshToken, profile, done) => {
        console.log('Chusmeando user:', profile)
        try {
            //miro si el mail existe en mi BD, xq si no existe lo tengo que crear
           let user = await UserModel.findOne({email:profile._json.email}) 
           //Si no existe lo creo.
           if (!user){ //Ahora los datos de user lo saco de profile, o sea de los datos de github
                
                    let newUser = {
                    first_name: profile._json.name,
                    last_name: 'last_name',
                    email: profile._json.email,
                    age: 15, //NO importa la edad por ahora....
                    password: 'secreto',//Lo dejo vacio xq no lo manejo, es problema de github
                    rol: 'user' //Para github solo le daria permisos de usuario.
                }
                //Creo el usuario en la BD
                let result = await UserModel.create(newUser)
                //Hago el done y envio el resultado con el user ya creado.
                done(null,result)
           }
           else{//Si el usuario existe mando el user encontrado
            console.log('Entro x aca')
                done(null,user)
           }
            
        } catch (error) {
            return  done(error)
        }

      }
    ))

}


/*6- Ya tenemos la estrategias ahora vamos a app.js y le decimos que lo va a usar y que ejecute nuesta funcion initializePassport.
        ////////////////////////////////////////////////////////
        //Cambios passport en app.js: 
        
        import passport from 'passport'

        initializePassport();
        app.use(passport.initialize());
        app.use(passport.session());
        ///////////////////////////////////////////////////////////

*/ 

/*7-Hacemos los endpoint de registro y login por donde se entrara a a usar passport*/