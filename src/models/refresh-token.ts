import mongoose, { Schema } from "mongoose";

export interface RefreshTokenDoc extends mongoose.Document {
  refreshToken: string;
  userId: mongoose.Types.ObjectId | null | undefined;
  expiresAt: Date;
}

const refreshTokenSchema = new Schema(
  {
    refreshToken: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

refreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
refreshTokenSchema.index({ userId: 1 }, { unique: true });

export const RefreshToken = mongoose.model("RefreshToken", refreshTokenSchema);
