import fs from "fs";

export const deleteLocalFile = async (filename: string) => {
  if (!filename) return;
  fs.unlink(filename, (err) => {
    if (err) {
      return { error: err, success: false };
    } else {
      return { error: null, success: true };
    }
  });
};
