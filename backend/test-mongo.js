const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGODB_URI;

mongoose.connect(uri)
    .then(() => {
        console.log("SUCCESS: Connected to MongoDB Atlas");
        process.exit(0);
    })
    .catch((err) => {
        console.error("ERROR: Failed to connect", err);
        process.exit(1);
    });
