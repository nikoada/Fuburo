const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const itemSchema = new Schema({
  name: {type: String, required: true},
  comment: { type: String, required: true },
  location: { type: String, required: true },
  lnglat: { type: String, required: true },
  type: {type: String, required: true},
  userId: String,
  time: String,
  tags: Array,
  location: Array,
  image: String,
  date: Date
});

itemSchema.pre("save", function(next){
  this.date = new Date();
  next();
});

const Item = mongoose.model("items" , itemSchema);
module.exports = Item;
