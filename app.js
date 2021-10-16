require('dotenv/config');
const express = require('express');
const app =express();
const morgan =require('morgan');
const mongoose =require('mongoose');
const cors = require("cors");
const authJwt = require("./helpers/jwt");
const errorHandler = require("./helpers/error-handler");


app.use(cors());
app.options("*", cors());



// middleware below code make express understand express
app.use(express.json());
app.use(morgan('tiny'));  
app.use(authJwt()); 

app.use('/public/uploads', express.static(__dirname + '/public/uploads'));
app.use(errorHandler);
app.use((req, res, next) => {
    res.append('Content-Range', 'items 0-19/350');
    res.append('Content-Type', 'application/json');

    next();
});

app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
    next();
});

//aloow images to access withut token.
//Routers//

const categoriesRoutes = require("./routes/categories");
const subcategoiesRoutes = require("./routes/subcategories");
const productsRoutes = require("./routes/products");
const usersRoutes = require("./routes/users");
const ordersRoutes = require("./routes/orders");
const baskketRoutes = require("./routes/basket");

const api='/api/v1';

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/subcategory`, subcategoiesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, ordersRoutes);
app.use(`${api}/basket`, baskketRoutes);



console.log('db done11')
//Database
mongoose.connect('mongodb+srv://admin:Admin@123@cluster0.y6afi.mongodb.net/eshop-database?retryWrites=true&w=majority',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName:'eshop-database'
}).then(()=>{
    console.log('db done')
}).catch((err)=>{
    console.log('err')
    console.log(err)  
    console.log('db err')
}); 

const PORT = 3000 || 3000;
//Server
app.listen(PORT,()=>{
    console.log(api);
    console.log('server in running now : http://localhost:3000/')
});