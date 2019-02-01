const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  email: {type: String, required: true},
  password: { type: String, required: true },
  date: Date
});

userSchema.pre("save", function(next){
  this.date = new Date();
  next();
});

const User = mongoose.model("users" , userSchema);
module.exports = User;
