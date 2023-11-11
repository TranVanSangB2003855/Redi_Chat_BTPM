const config = {
    app: {
        port: 3000 ,
    },
    db: {
        uri: process.env.MONGODB_URI ||"mongodb+srv://admin:TRVASAmb6902@cluster0.ekgkgef.mongodb.net/redi" //"mongodb://127.0.0.1:27017/redi_chat" 
    },
    secret: "redi-chat"
};

module.exports = config;