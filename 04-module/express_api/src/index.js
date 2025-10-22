// package.json "type": "commonjs"
const express = require('express')
const bodyParser = require('body-parser')

// package.json "type": "module"
//import express from 'express'
//import bodyParser from 'body-parser'

const app = express()
const port = 3000

app.use(bodyParser.json())

app.get('/', (req, res) => {
  const timestamp = new Date().toISOString(); // e.g. 2025-10-21T14:30:00.123Z
  res.send(`Hello world from express_api. Current time is: ${timestamp}`)
})

app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})