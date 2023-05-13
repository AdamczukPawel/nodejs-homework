import fs from "fs/promises";

const patchExists = (path) => {
  return fs
    .access(path)
    .then(() => true)
    .catch(() => false);
};

export const folderCreator = async (path) => {
  if (!(await patchExists(path))) {
    await fs.mkdir(path);
  }
};
