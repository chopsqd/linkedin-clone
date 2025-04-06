import * as fs from "fs";
import * as path from "path";

import { diskStorage } from "multer";
import { v4 as uuidv4 } from "uuid";
import FileType from "file-type";

import { from, Observable, of } from "rxjs";
import { switchMap } from "rxjs/operators";

type ValidFileExtension = "png" | "jpg" | "jpeg";
type ValidMimeType = "image/png" | "image/jpeg";

const validFileExtensions: ValidFileExtension[] = ["png", "jpg", "jpeg"];
const validMimeTypes: ValidMimeType[] = ["image/png", "image/jpeg"];

export const saveImageToStorage = {
  storage: diskStorage({
    destination: "./images",
    filename: (req, file, cb) => {
      const fileExtension: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtension;

      cb(null, fileName);
    }
  }),
  fileFilter: (req, file, cb) => {
    const isValidMimeType = validMimeTypes.includes(file.mimetype);
    cb(null, isValidMimeType);
  }
};

export const isFileExtensionSafe = (fullFilePath: string): Observable<boolean> => {
  return from(FileType.fromFile(fullFilePath)).pipe(
    switchMap((fileInfo) => {
      if (!fileInfo) return of(false);

      const isFileTypeLegit = validFileExtensions.includes(fileInfo.ext as ValidFileExtension);
      const isMimeTypeLegit = validMimeTypes.includes(fileInfo.mime as ValidMimeType);

      return of(isFileTypeLegit && isMimeTypeLegit);
    })
  );
};

export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (err) {
    console.error(err);
  }
};