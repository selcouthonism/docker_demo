const mongoose = require('mongoose');

const storeSchema = new mongoose.Schema({
    key: {type: String, required: true, unique: true},
    value: {type: String, required: true}
})

const StoreKeyValue = mongoose.model('StoreKeyValue', storeSchema);

module.exports = {
    StoreKeyValue
}