module.exports.projects = {
  "mocha-helloworld": {
    name: "mocha-helloworld",
    path: "D:/mocha/mocha-demos/mocha-helloworld",
    type: "mocha",
    cmd: "mocha",
    suites: {
      "1": "test/helloworld.test.js",
      "2": "test/assertCount.test.js",
      "3": "test/contextinject.test.js",
      "4": "test/batchdiff.test.js",
      "5": "test/http.test.js",
      "6": "test/mysql.test.js",
      "7": "test/mysqlStoredCases.test.js",
      "8": "test/process.test.js",
      "9": "test/async.test.js",
      "10": "test/biz.test.js",
      "11": "test/helloworld.test.js",
      "12": "test/jsondiff.test.js",
      "13": "test/mysqlStoredCases.promise.test.js",
      "14": "test/params.test.js",
    },
    defaultContext: {
      "name": "mocha-helloworld",
      "version": "1.0.0",
      "description": "",
      "main": "index.js"
    }
  },
  "pytest-demo": {
    name: "pytest-demo",
    path: "D:/Github/unittest-demos",
    type: "pytest",
    cmd: "pytest",
    suites: {
      "1": "test/runner.py",
      "2": "test/test_batchdiff.py",
      "3": "test/test_decorator.py",
      "4": "test/test_file.py",
      "5": "test/test_jsondiff.py",
      "6": "test/test_parameterized.py",
      "7": "test/test_apiparams.py",
      "8": "test/test_context.py",
      "9": "test/test_dictdiff.py",
      "10": "test/test_helloworld.py",
      "11": "test/test_list.py",
      "12": "test/test_requests.py",
    },
    defaultContext: {
      "name": "pytest demo",
      "version": "1.0.0",
      "description": "",
      "main": "index.js"
    }
  },
  "python-demo": {
    name: "python-demo",
    path: "D:/Github/unittest-demos",
    type: "python",
    cmd: "python",
    suites: {
      "1": "test/runner.py",
      "2": "test/test_batchdiff.py",
      "3": "test/test_decorator.py",
      "4": "test/test_file.py",
      "5": "test/test_jsondiff.py",
      "6": "test/test_parameterized.py",
      "7": "test/test_apiparams.py",
      "8": "test/test_context.py",
      "9": "test/test_dictdiff.py",
      "10": "test/test_helloworld.py",
      "11": "test/test_list.py",
      "12": "test/test_requests.py",
    },
    defaultContext: {
      "name": "pytest demo",
      "version": "1.0.0",
      "description": "",
      "main": "index.js"
    }
  },
  "junit-demo": {
    name: "junit-demo",
    path: "D:/Github/testng-demos/com.test.apitest",
    type: "maven",
    cmd: "mvn test -Dtest=",
    suites: {
      "1": "*",
      "2": "AppTest.java",
      "3": "CalendarTest.java",
      "4": "JunitJsonDiffTest.java",
      "5": "BatchDiffTest.java",
      "6": "CounterTest.java",
      "7": "TestNGJsonDiffTest.java",
    },
    defaultContext: {
      "name": "junit-demo",
      "version": "1.0.0",
      "description": "",
      "main": "index.js"
    }
  },
}

module.exports.get = function (projectName, spec, context) {
  const project = this.projects[projectName];
  var sh = "sh";
  var args = ['-c', project.cmd];
  if (process.platform === "win32") {
    sh = "cmd";
    args[0] = "/c";
  }
  if (spec) {
    args[1] = args[1] + (project.type != 'maven' && " " || "") + project.suites[spec];
  }
  var env = JSON.parse(JSON.stringify(process.env));
  if (context) {
    env.mochacontext = context;
  }
  else {
    env.mochacontext = JSON.stringify(project.defaultContext);
  }

  return {
    sh: sh,
    args: args,
    cwd: project.path,
    env: env,
  }
}