import mongoose from "mongoose";

//Me conecto a la BD

function initDataBaseConnection(){

    mongoose.connect('mongodb+srv://gui24xrdev:2485javiersolis@cluster0.a6zgcio.mongodb.net/ecommerce?retryWrites=true&w=majority&appName=Cluster0')
    .then(console.log('Conexion con BD OK !'))
    .catch((error)=>console.log(error))

}

export {initDataBaseConnection}