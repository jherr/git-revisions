const gitRevisionIterator = require("../src/index");
const fs = require("fs");

gitRevisionIterator({}, (data, info) => {
  var newData = data;
  if (info.changed) {
    newData = JSON.parse(fs.readFileSync("package.json").toString());
  }
  console.log([info.dayOffset, info.changed, info.revision, data.version, newData.version]);
  return newData;
}, {
  cwd: process.argv[2]
});
