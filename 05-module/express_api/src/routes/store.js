const express = require('express');
const asyncHandler = require('../middlewares/asyncHandler');
const storeService = require('../services/storeService');

const storeRouter = express.Router();

storeRouter.post('/', asyncHandler(async (req, res) => {
  const { key, value } = req.body;
  if (!key || !value) return res.status(400).json({ error: 'Both key and value required!' });

  await storeService.createKeyValue(key, value);
  res.status(201).json({ message: 'Key-Value pair stored successfully' });
}));

storeRouter.get('/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  const kv = await storeService.getKeyValue(key);
  if (!kv) return res.status(404).json({ error: 'Key not found.' });
  res.status(200).json({ key, value: kv.value });
}));

storeRouter.put('/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;
  const kv = await storeService.updateKeyValue(key, value);
  res.status(200).json({ key, value: kv.value });
}));

storeRouter.delete('/:key', asyncHandler(async (req, res) => {
  const { key } = req.params;
  await storeService.deleteKeyValue(key);
  res.status(204).send();
}));

module.exports = { storeRouter };