git-revisions
=============

Git Revisions is a git revision iterator that allows you to roll back the clock day-by-day on a git repo.

# Example

This code looks at the `package.json` each day in the project located at `/project/myProject`.

```
const gitRevisionIterator = require("git-revisions");
const fs = require("fs");

gitRevisionIterator({}, (data, info) => {
  var newData = data;
  if (info.changed) {
    newData = JSON.parse(fs.readFileSync("package.json").toString());
  }
  console.log([info.dayOffset, info.changed, info.revision, data.version, newData.version]);
  return newData;
}, {
  cwd: "/project/myProject"
});
```

The result looks like this:

```
[ 0,
  true,
  'b5c87ed66e816eb22a2d1b630b7de73cfdf515cd',
  undefined,
  '7.0.1' ]
[ 1,
  false,
  'b5c87ed66e816eb22a2d1b630b7de73cfdf515cd',
  '7.0.1',
  '7.0.1' ]
[ 2,
  false,
  'b5c87ed66e816eb22a2d1b630b7de73cfdf515cd',
  '7.0.1',
  '7.0.1' ]
...
```

# Documentation

```
gitRevisionIterator(initialData, callback, options);
```

The `initialData` is whatever you want to pass into the iteration function as it's initial state.
The data is passed into your iterator callback, and whatever you return from that callback is
then sent into the next round. This way, if what you are doing is some expensive analysis of the target
repo, then you can only do that if the callback is told that the repo has changed, otherwise it can
just use the previous day's data.

The `callback` is called with two parameters `data` and `info`. Data is the data that started with
`initialData` but it updated with the return from the `callback`. `info` is an object with these details:
`changed` is true if the repo revision has changed from the previous day. `revision` is the current
revision. `previousRevision` is the previous revision from the day before. `date` is the current date, and
`dayOffset` is the current offset from the start date.

The `options` object allows you to tweak the operation of the iterator. The only option you really
must provide is `cwd` which is the directory of the target project. `gitCommand` is the command
to use for `git`, it defaults to `git`. `dayRange` is the number of days to iterate, it defaults to `90`.
`startDate` is the day to start on, the default is the current date. `branch` is the branch to operate
on, it defaults to `master`.

At the end of iteration the repo is returned to the `HEAD` automatically. And the process `cwd` is
returned to the directory where it started.
