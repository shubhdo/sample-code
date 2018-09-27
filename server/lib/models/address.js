const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema({
    line1: {
        type: String
    },
    line2: {
        type: String
    },
    city: {
        type: String
    },
    state: {
        type: String
    },
    postalCode: {
        type: String
    },
    country: {
        type: String
    }
});


module.exports = mongoose.model('address', addressSchema, 'address');
