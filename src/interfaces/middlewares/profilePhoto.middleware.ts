import multer from "multer";

export const profilePhotoUpload = multer({
  storage: multer.memoryStorage(),
}).single("foto");
