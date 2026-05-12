import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name:      { type: String, required: true },
    firstName: { type: String, default: "" },
    lastName:  { type: String, default: "" },
    email:     { type: String, required: true, unique: true },
    password:  { type: String, required: true },
    phone:     { type: String, default: "" },
    avatar:    { type: String, default: "" },
  }, 
  { timestamps: true }
);

// ✅ comparePassword method — used in change password
userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password);
};

export default mongoose.model("User", userSchema);