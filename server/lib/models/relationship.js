const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const relationshipSchema = new Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  transitive: {
    type: Boolean,
    default: false
  },
  professional: {
    type: Boolean,
    default: false
  },
  aliases: {
    type: [String]
  },
  gloss: {
    type: String
  },
  inverseOf: {
    type: Schema.Types.ObjectId,
    ref: 'relationships',
    required: true
  }
});

module.exports = mongoose.model('relationships', relationshipSchema, 'relationships');
