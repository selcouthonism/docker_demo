const { StoreKeyValue } = require('../models/store');

async function getKeyValue(key) {
  return StoreKeyValue.findOne({ key });
}

async function createKeyValue(key, value) {
  const existing = await StoreKeyValue.findOne({ key });
  if (existing) throw { status: 400, message: 'Key already exists.' };

  const keyValue = new StoreKeyValue({ key, value });
  return keyValue.save();
}

async function updateKeyValue(key, value) {
  const updated = await StoreKeyValue.findOneAndUpdate({ key }, { value }, { new: true });
  if (!updated) throw { status: 404, message: 'Key not found.' };
  return updated;
}

async function deleteKeyValue(key) {
  const deleted = await StoreKeyValue.findOneAndDelete({ key });
  if (!deleted) throw { status: 404, message: 'Key not found.' };
  return deleted;
}

module.exports = {
  getKeyValue,
  createKeyValue,
  updateKeyValue,
  deleteKeyValue,
};