const express = require('express');

const port = process.env.PORT || 3001;
const app = express();

app.get('/', (req,res)=> {
    res.json( {message: 'Hello from notes'});
});

app.listen(port, () => {
    console.log(`Notes server listening on port ${port}`);
});