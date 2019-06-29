// Generated by CoffeeScript 1.10.0
var datetimeRegex, getDuration;

datetimeRegex = /^(?:\s*(Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s*)?(0?[1-9]|[1-2][0-9]|3[01])\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+(19[0-9]{2}|[2-9][0-9]{3}|[0-9]{2})\s+(2[0-3]|[0-1][0-9]):([0-5][0-9])(?::(60|[0-5][0-9]))?\s+([-\+][0-9]{2}[0-5][0-9]|(?:UT|GMT|(?:E|C|M|P)(?:ST|DT)|[A-IK-Z]))\s*/;

getDuration = function(string) {
  var duration;
  duration = string.match(/\((\d+m?s)\)/);
  if (duration) {
    duration = duration[1];
  }
  return duration;
};

module.exports = function(socket, sce, progress, finished) {
  var addError, addtotree, parseLine, reset, result, state;
  console.log("in parser");
  addtotree = function(data) {
    var branch, current, found, i, j, last, len, len1, level, lvl, newBranch, ref, ref1;
    if (data.levels) {
      current = result.tree;
      last = null;
      ref = data.levels;
      for (i = 0, len = ref.length; i < len; i++) {
        lvl = ref[i];
        found = false;
        ref1 = current.branches;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          branch = ref1[j];
          if (branch.name === lvl) {
            last = current;
            current = branch;
            found = true;
            break;
          }
        }
        if (!found) {
          last = current;
          level = current.level.slice(0);
          level.push(level.length);
          newBranch = {
            name: lvl,
            branches: [],
            leaves: [],
            level: level
          };
          current.branches.push(newBranch);
          current = newBranch;
        }
      }
      return current.leaves.push(data);
    }
  };
  addError = function() {
    var d, i, len, ref;
    ref = result.failed;
    for (i = 0, len = ref.length; i < len; i++) {
      d = ref[i];
      if (d.failure && d.failure === state.error.id) {
        d.failure = state.error.text.join("\n");
      }
    }
    if (result.failed.length === parseInt(state.error.id)) {
      console.log("calling finished");
      finished();
    }
    return console.log("failed " + result.failed.length + " errorid " + state.error.id);
  };
  result = {};
  state = {};
  reset = function() {
    console.log("resetting data");
    result.data = [];
    result.tree = {
      level: [],
      branches: []
    };
    result.failed = [];
    result.console = [];
    result.duration = "";
    state.levels = [];
    state.indent = 0;
    state.inTest = true;
    state.inError = 0;
    return state.error = {};
  };
  reset();
  socket.on("restart", reset);
  parseLine = function(cLine) {
    var currentIndent, id, item, name, removecount;
    console.log(cLine);
    if (cLine.text.indexOf("\u001b") > -1) {
      cLine.text = "";
      reset();
    } else {
      if (cLine.text !== "") {
        currentIndent = cLine.text.match(/(^\s*)/)[1].length;
        if (currentIndent > 1) {
          name = cLine.text.substring(currentIndent);
          if (state.inTest) {
            if (name[0] === "✓") {
              name = name.substring(2);
              item = {
                type: "pass",
                title: name,
                fullTitle: state.levels.join(" ") + " " + name,
                levels: state.levels.slice(),
                duration: getDuration(name)
              };
              result.data.push(item);
              addtotree(item);
              cLine.type = "pass";
            } else if (name.search(/^\d+\)/) > -1) {
              id = name.match(/(^\d+)\)/)[1];
              name = name.replace(/^\d+\)/, "");
              item = {
                type: "fail",
                title: name,
                fullTitle: state.levels.join(" ") + " " + name,
                levels: state.levels.slice(),
                failure: id,
                duration: getDuration(name)
              };
              result.failed.push(item);
              addtotree(item);
              cLine.type = "fail";
            } else if (name.search(/^\d+ passing/) > -1) {
              state.inTest = false;
              result.duration = getDuration(name);
              if (result.failed.length === 0) {
                finished();
              }
            } else {
              if (currentIndent > state.indent) {
                state.levels.push(name);
              } else if (currentIndent === state.indent) {
                state.levels[state.levels.length - 1] = name;
              } else {
                removecount = (state.indent - currentIndent) / 2;
                state.levels.splice(state.levels.length - removecount, removecount);
                state.levels[state.levels.length - 1] = name;
              }
              state.indent = currentIndent;
              cLine.type = "level";
            }
          } else {
            if (state.inError) {
              state.error.text.push(name);
              state.inError++;
            } else if (name.search(/^\d+\)/) > -1) {
              id = name.match(/(^\d+)\)/)[1];
              state.error = {
                id: id,
                text: []
              };
              state.inError = 1;
            }
            if (state.inError === 2) {
              cLine.type = "error";
            }
          }
        } else {
          if (cLine.text.search(datetimeRegex) > -1) {
            cLine.text = cLine.text.replace(datetimeRegex, "");
            cLine.type = "stderr";
          }
        }
      } else {
        if (state.inError) {
          state.inError = 0;
          addError();
        }
      }
    }
    if (!cLine.html) {
      console.log("creating html");
      if (cLine.text) {
        cLine.html = sce.trustAsHtml(cLine.text.replace(/ /g, "&nbsp;"));
      } else {
        cLine.html = sce.trustAsHtml("<br>");
      }
    }
    result.console.push(cLine);
    console.log("progressing");
    return progress();
  };
  socket.on("consoleLine", parseLine);
  socket.on("getConsole", function(currentConsole) {
    var cLine, i, len, results;
    reset();
    results = [];
    for (i = 0, len = currentConsole.length; i < len; i++) {
      cLine = currentConsole[i];
      results.push(parseLine(cLine));
    }
    return results;
  });
  return result;
};
