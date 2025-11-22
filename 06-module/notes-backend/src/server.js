const express = require('express');
const mongoose = require('mongoose');

const port = process.env.PORT || 3001;
const app = express();

app.get('/api/notes', (req,res)=> {
    res.json( {message: 'Hello from notes'});
});

mongoose.connect(process.env.DB_URL).then( () => {
    console.log('Connected to mongoDB! Starting server.');
    app.listen(port, () => {
        console.log(`Notes server listening on port ${port}`);
    });
}).catch(err => {
    console.error('Something went wrong!');
    console.error(err);
});