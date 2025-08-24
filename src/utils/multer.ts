import multer from "multer";
import path from "path";
import { BadRequestError } from "../errors";
import { Request } from "express";
import fs from "fs";
import crypto from "crypto";

const uploadConfigs = {
  maxFileSize: 1024 * 1024 * 10,
  allowedTypes: [
    "image/jpeg",
    "image/png",
    "image/jpg",
    "image/svg+xml",
    "image/gif",
    "image/webp",
    "application/pdf",
    "application/msword",
    "text/plain",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  allowedExtensions: [
    ".jpg",
    ".jpeg",
    ".png",
    ".pdf",
    ".docx",
    ".doc",
    ".txt",
    ".xlsx",
    ".xls",
    ".webp",
    ".svg",
  ],
  uploadPath: path.join(__dirname, "../uploads"),
};

if (!fs.existsSync(uploadConfigs.uploadPath)) {
  fs.mkdirSync(uploadConfigs.uploadPath);
}

const generateFilename = (file: Express.Multer.File) => {
  const ext = path.extname(file.originalname);
  const name = path
    .basename(file.originalname, ext)
    .replace(/\s/g, "-")
    .toLowerCase();
  return `${name}-${crypto.randomBytes(16).toString("hex")}${ext}`;
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    return cb(null, uploadConfigs.uploadPath);
  },
  filename: (req, file, cb) => {
    const filename = generateFilename(file);
    return cb(null, filename);
  },
});

const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: (error: any, acceptFile: boolean) => void
) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (!uploadConfigs.allowedExtensions.includes(ext)) {
    return cb(new BadRequestError("This extension is not allowed"), false);
  }

  if (!uploadConfigs.allowedTypes.includes(file.mimetype)) {
    return cb(new BadRequestError("Invalid file type"), false);
  }

  if (
    file.originalname.includes("..") ||
    file.originalname.includes("/") ||
    file.originalname.includes("\\")
  ) {
    return cb(new Error("Invalid filename"), false);
  }

  return cb(null, true);
};

export const upload = multer({
  storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: uploadConfigs.maxFileSize,
  },
});
