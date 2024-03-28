import express from 'express'
import { UserModel } from '../models/user.models.js'
import passport from 'passport'

export const router = express.Router()


router.get('/api/sessions/registrarse',async(req,res)=>{
    res.render('register')
})

router.get('/api/sessions/login',(req,res)=>{
    res.render('login')
})

/*
router.post('/api/sessions/registrarse',async(req,res)=>{
    //Recibo los datos del nuevo usuario.
    const {first_name,last_name,age,email,password,rol} = req.body
    try{
        //Como en mongo el email es unico si hay un email igual rebota el nuevo user.
        await UserModel.create({first_name,last_name,age,email,password,rol})
        //res.status(400).send({message:'Usuario creado con exito...'})
        res.redirect('api/sessions/login')

    }catch(error){
        res.status(400).send({error:'Error al crear el usuario...'})
    }
})

router.post('/api/sessions/login',async(req,res)=>{
    const {email,password} = req.body
    //Comprueno que exista en la BD un user con el email
    try {
        const usuario = await UserModel.findOne({email:email})
        if(usuario){
            //Chequeo el password.
            usuario.password == password 
            ?
            (   //Estas propiedades se las quito o pongo segun haya sesion iniciada o no.
                req.session.login = true, 
                req.session.user = usuario, //Incluye rol en los datos de user
                res.redirect('/products')
            ):
            (
                res.status(400).send({error:'Contraseña no valida...'})
            )
           }
        else{
            res.status(400).send({error:'El usuario no existe...'})
        }
    } catch (error) {
        res.status(400).send({error:'Error del servidor...'})
    }
})

*/

router.post('/api/sessions/registrarse',passport.authenticate("register",{failureRedirect:'/failedregister'}),async(req,res)=>{
    res.redirect('/api/sessions/login') //Si salio todo Ok reenviamos  a login
})

router.post('/api/sessions/login',passport.authenticate("login",{failureRedirect:'/failedlogin'}),async(req,res)=>{
    //si todo salio o inicio los datos de la cesion y redirijo a profile
        //console.log('Req:',req)
    //Los datos del user logueado ahora van a venir en req.
    //Los trae req xq en la estrategia hice return(done,user)
    req.session.login = true
    req.session.user = req.user //req.user tiene role
    req.session.admin = req.user.role == 'admin' ? true : false //Para saber si se trata de un admin
    res.redirect('/products')

})

router.get("/github", passport.authenticate("github", {scope: ["user:email"]}) ,async (req, res)=> {
    console.log('ghfdgfgfdrfffffffffffffffffffffffff')
})


router.get("/githubcallback", passport.authenticate("github", {failureRedirect: "/failedlogin"}) ,async (req, res)=> {
    //si todo salio o inicio los datos de la cesion y redirijo a profile
    
    console.log('Requiressss:',req)
    //Los datos del user logueado ahora van a venir en req.
    //Los trae req xq en la estrategia hice return(done,user)
    req.session.login = true
    req.session.user = req.user//usuario//Incluye rol en los datos de user
    req.session.admin = req.user.role == 'admin' ? true : false //Para saber si se trata de un admin
    res.redirect('/products')

})



router.get('/api/sessions/logout',(req,res)=>{
    //Destruye la sesion y redirige a la portada.
    if ( req.session.login ){
        req.session.login = false //Pongo esta propiedad inventada por mi a false.
        delete req.session.user //Le borro el user de la propiedad
        delete req.session.admin //Lo mismo con admin
        req.session.destroy()
       
   
    }
    //res.status(200).send('Se ah eliminado el login...')
    res.redirect('/')
})


//Middleware para autorizacion a lugares que solo puede llegar un admin.
function authAdmin(req,res,next){
     if (req.session.role == 'admin') return next() 
    else 
        return res.status(403).render('errorpage',{state:403,message:'Error de autorizacion... Se necesitan credenciales de admin para ingresar...'})//send('Error de autorizacion... Se necesitan credenciales de admin para ingresar...')
}

router.get('/privado',authAdmin,(req,res)=>{
    res.send('El usuario logueado es Admin por eso puede llegar a aca...')
    
})

//Middleware para autorizacion a lugares que solo puede llegar un ususario logueado
function authlogged(req,res,next){
    if (req.session.login) {
        return next() 
    }
    else 
    {
        return res.status(403).render('errorpage',{state:403,message:'Error de autorizacion... Se necesitan iniciar sesion para ingresar...'})//send('Error de autorizacion... Se necesitan credenciales de admin para ingresar...')

    }
    
}



router.get('/profile',authlogged,(req,res)=>{

    //res.send('El usuario logueado es Admin por eso puede llegar a aca...')
    res.render('profile')
})

router.use('/failedregister',(req,res)=>{
    res.status(403).render('errorpage',{state:403,message:'Fallo en registro de usuario...'})
})

router.use('/failedlogin',(req,res)=>{

    res.status(403).render('errorpage',{state:403,message:'Fallo al iniciar sesion...'})
})
