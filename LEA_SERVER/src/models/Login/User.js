import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    passwordHash: {
      type: String,
      required: true,
      select: false, // no se devuelve por defecto
    },

    rol: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

userSchema.methods.setPassword = async function (plainPassword) {
  const saltRounds = 12;
  this.passwordHash = await bcrypt.hash(plainPassword, saltRounds);
};

userSchema.methods.comparePassword = async function (plainPassword) {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

export const User = mongoose.model("UsuariosAmbiocom", userSchema);
