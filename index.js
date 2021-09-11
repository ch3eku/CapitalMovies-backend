const express = require('express');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config()

const { MONGO_URI } = process.env;
const { API_PORT } = process.env;
const port = process.env.PORT || API_PORT;

// Routes 
const userRoutes = require('./routes/user');

mongoose.connect(MONGO_URI,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Database Connected");
    })
    .catch((err) => {
        console.log("Database Connection Failed");
        console.log(err)
    })

app.use(express.json());

app.use(userRoutes);

app.listen(port, () => {
    console.log("Server runnig at port 8080");
})