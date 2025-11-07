const express = require('express');
const mongoose = require('mongoose');

const app = express();

app.get('/health', (req, res) => {
  res.status(200).send('up');
});

console.log('Connecting to DB...');

mongoose.connect('mongodb://mongodb/key-value-db', {
  auth: {
    username: 'key-value-user',
    password: 'key-value-password'
  },
  connectTimeoutMS: 5000 // 5 seconds is more reasonable
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(3000, () => console.log('Listening on port 3000'));
  })
  .catch(err => {
    console.error('Something went wrong while connecting to MongoDB!');
    console.error(err);
  });
