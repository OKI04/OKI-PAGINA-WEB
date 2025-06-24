const mongoose  = require("mongoose");

const uri = "mongodb+srv://user_maye:9rP_nVKnmCBzcc!@clusteroki.8ucxdw7.mongodb.net/?retryWrites=true&w=majority&appName=ClusterOKI";


const connection = async() => {
    try {

        //Parametros a pasar dentro de un objeto:
        //useNewUrlParser: true
        //useUnifiedTopology: true
        //useCreateIndex: true
        await mongoose.connect(uri);
        console.log("Conectado a MongoDB Atlas");

    } catch(error) {
        console.log(error);
        throw new Error("No se ha podido conectar a la base de datos");
    }
}

module.exports = {
    connection
};