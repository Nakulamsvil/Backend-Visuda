const path = require("path");
const fs = require("fs");

const fileDir = () => {
  const dirPath = path.join(__dirname, "../..", "file");
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
};

module.exports = {
  fileDir,
};
