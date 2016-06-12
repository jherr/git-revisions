const async = require("async");
const exec = require("child_process").exec;
const moment = require("moment");

const _getRevision = (git, cb) => {
  exec(git + " rev-parse HEAD", (error, stdout, stderr) => {
    if (error !== null) {
      cb(error, null);
    } else {
      var revision = stdout.replace(/\s+/g, "");
      cb(null, revision);
    }
  });
}

const _returnToHead = (git, branch, cb) => {
  exec(git + " checkout " + branch, (error, stdout, stderr) => {
    if (error !== null) {
      cb(error);
    } else {
      cb(null);
    }
  });
}

const _checkoutAtDate = (git, branch, date, cb) => {
  exec(git + " checkout `" + git + " rev-list -n 1 --before=\"" + date + "\" " + branch + "`",
    (error, stdout, stderr) => {
      if (error !== null) {
        cb(error);
      } else {
        cb(null);
      }
    });
}

module.exports = (data, iteratorFunc, options) => {
  options = options || {};
  const gitCommand = options.gitCommand || "git";
  const cwd = options.cwd || process.cwd();
  const dayRange = options.dayRange || 90;
  const branch = options.branch || "master";
  const startDate = options.startDate || new Date();

  const startingWD = process.cwd();

  var dayOffset = 0;
  var currentRevision = "";

  process.chdir(cwd);

  async.whilst(
    () => dayOffset < dayRange,
    (complete) => {
      var date = moment(startDate).subtract(dayOffset, "days").format("YYYY-MM-DD");
      async.series([
        (done) => {
          _checkoutAtDate(gitCommand, branch, date, (err, revision) => {
            if (err) { throw(err); }
            done();
          });
        },
        (done) => {
          _getRevision(gitCommand, (err, revision) => {
            if (err) { throw(err); }
            var changed = revision !== currentRevision;
            data = iteratorFunc(data, {
              dayOffset,
              date,
              changed,
              previousRevision: currentRevision,
              revision
            });
            currentRevision = revision;
            done();
          });
        },
      ], () => {
        dayOffset++;
        complete();
      });
    },
    () => {
      async.series([
        (done) => {
          _returnToHead(gitCommand, branch, (err) => {
            done();
          });
        }
      ], () => {
        process.chdir(startingWD);
      });
    }
  )
}
