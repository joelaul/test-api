const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  stats: {
    atk: {
      type: Number,
      required: true,
    },
    def: {
      type: Number,
      required: true,
    },
    hp: {
      type: Number,
      required: true,
    },
  },
});

module.exports = mongoose.model("Entry", entrySchema);
