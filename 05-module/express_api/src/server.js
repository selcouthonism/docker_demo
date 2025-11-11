const express = require('express');
const mongoose = require('mongoose');

const {healthRouter} = require('./routes/health');
const {storeRouter} = require('./routes/store');
const errorHandler = require('./middlewares/errorHandler');

const port = process.env.PORT || 3000;

const app = express();
app.use(express.json());

app.use(errorHandler); // centralized
app.use('/health', healthRouter);
app.use('/store', storeRouter);

console.log('Connecting to DB...');

mongoose.connect(`mongodb://${process.env.MONGODB_HOST}/${process.env.KEY_VALUE_DB}`, {
  auth: {
    username: process.env.KEY_VALUE_USER,
    password: process.env.KEY_VALUE_PASSWORD
  },
  connectTimeoutMS: 5000 // 5 seconds is more reasonable
})
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(port, () => console.log(`Listening on port ${port}`));
  })
  .catch(err => {
    console.error('Something went wrong while connecting to MongoDB!');
    console.error(err);
  });
