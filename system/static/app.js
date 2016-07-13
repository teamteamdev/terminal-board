var inviteCode = undefined;
var teamId = 0;
var currentDirectory = '/';

function handleCommand(_cmd, term) {
  var cmd = $.trim(_cmd);
  if (cmd == 'help') {
    term.echo("List of available commands:\n[[b;white;black]help]           list of available commands\n[[b;white;black]login] <invite> login into system\n[[b;white;black]logout]         logout\n[[b;white;black]ls]             list of files in current directory*\n[[b;white;black]cd] <dir>       go to [[b;white;black]<dir>] directory*\n[[b;white;black]cat] <file>     print file [[b;white;black]<file>] from current directory on screen*\n<file>         execute file [[b;white;black]<file>] from current directory*\n* commands available only when you logged in\nSupport: ctf@upml.tech");
  } else if (cmd.match(/^login/)) {
    if (cmd.match(/^login [A-Za-z0-9]{12}$/)) {
      if (teamId > 0) {
        term.echo("[[;red;black]ERROR] You're already logged in");
      } else {
        inviteCode = cmd.match(/^login ([A-Za-z0-9]{12})$/)[1];
        term.pause();
        $.get('/auth', {'invite': inviteCode}, function(data) {
          if (data["error"]) {
            term.echo("[[;red;black]ERROR] " + data["description"]);
            inviteCode = undefined;
            term.resume();
          } else {
            term.echo("[[;green;black]SUCCESS] You are logged in as [[b;white;black]" + data["team_name"] + "].");
            teamId = data["team_id"];
            term.set_prompt("team" + teamId + "@upmlctf:/$ ");
            term.resume();
            if (localStorage) localStorage.setItem('invite', inviteCode);
            fetchTasks();
          }
        });
      }
    } else {
      term.echo("Usage: [[b;white;black]login] XXXXXX\n\nXXXXXX - invite code, which you received from jury");
    }
  } else if (cmd == 'logout') {
    if (teamId == 0) {
      term.echo("[[;red;black]ERROR] You're already logged out.");
    } else {
      teamId = 0;
      inviteCode = undefined;
      term.echo("[[b;white;black]Bye! See you again!]");
      term.pause();
      if (localStorage) localStorage.removeItem('invite');
      setTimeout(function(){
        window.location = 'http://ugrafmsh.ru/';
      }, 100);
    }
  } else if (cmd == 'ls') {
    if (inviteCode == undefined) {
      term.echo("[[;red;black]ERROR] You should log in to see this content.");
    } else if (currentDirectory == '/') {
      term.echo("Current directory: [[b;white;black]/]");
      term.echo("README  [[;blue;black]tasks/]  [[;green;black]post]  [[;green;black]scoreboard]");
    } else if (currentDirectory == '/tasks') {
      term.echo("Current directory: [[b;white;black]/tasks]");
      term.echo("[[;blue;black]../]  [[;green;black]post]");
      $.each(taskCats, function(catName, ptsArr) {
        taskLine = "";
        $.each(ptsArr, function(tcid, pts) {
          fullName = catName + pts;
          if (tasks[taskIds[fullName]]["solved"]) taskLine += "[[s;white;black]";
          taskLine += fullName;
          if (tasks[taskIds[fullName]]["solved"]) taskLine += "]";
          taskLine += "  ";
        });
        term.echo(taskLine);
      });
    } else {
      term.echo("[[;red;black]ERROR] Something is wrong with [[b;white;black]currentDirectory] variable.");
    }
  } else if (cmd.match(/^cd +(.+)$/)) {
    nextDirectory = cmd.match(/^cd +(.+)$/)[1];
    if (nextDirectory == '.') {
      term.echo("You're already here!");
    } else if (currentDirectory == '/' && nextDirectory.match(new RegExp('^/?tasks/?$'))) {
      term.set_prompt("team" + teamId + "@upmlctf:/tasks$ ");
      currentDirectory = '/tasks';
    } else if (currentDirectory == '/tasks' && (nextDirectory == '/' || nextDirectory.match(new RegExp('^\\.\\./?$')))) {
      term.set_prompt("team" + teamId + "@upmlctf:/$ ");
      currentDirectory = '/';
    } else {
      term.echo("Selected directory does not exist");
    }
  } else if (cmd.match(/^cat +(.+)$/)) {
    filename = cmd.match(/^cat +(.+)$/)[1];
    if (currentDirectory == '/' && filename == "README") {
      term.echo("[[b;green;black]Hello!] If you can open this file, this interface is very easy for you!\n\n" +
      "I will note two things:\n\n" +
      "First of all: [[b;white;black]post] utility is inside this directory and inside [[b;white;black]tasks] directory. " +
      "If you want to submit service flags (attack-defense), please use utility in root directory. If you want to submit " +
      "task flags, use utility in [[b;white;black]tasks] directory. Note that wrong submits for tasks will be penaltied.\n\n" +
      "And one more thing: I mentioned about VPN. Use config at http://ctf.upml.tech/media/config.ovpn to access our VPN. " +
      "Credentials for SSH: login = [[b;white;black]team], password = your invite code.\n\n" +
      "Best luck!"
      );
    } else if (currentDirectory == '/' && (filename == "tasks" || filename == "tasks/")) {
      term.echo("It's a directory! Use [[b;white;black]cd tasks] to open it.");
    } else if (currentDirectory == '/' && filename == "scoreboard") {
      term.echo("[[;green;black]scoreboard] is an executable program. Type [[b;white;black]scoreboard] to run it!");
    } else if (filename == "post") {
      term.echo("[[;green;black]post] is an executable program. Type [[b;white;black]post] to run it!");
    } else if (currentDirectory == '/tasks' && (filename == ".." || filename == "../")) {
      term.echo("It's a directory! Use [[b;white;black]cd ..] to open it.");
    } else if (currentDirectory == '/tasks' && taskIds[filename]) {
      var tid = taskIds[filename];
      term.echo("Task [[b;white;black]" + tasks[tid]["name"] + "], " + tasks[tid]["category"] + ", " + tasks[tid]["points"] + " points");
      term.echo(" ");
      term.echo(tasks[tid]["text"]);
      if (tasks[tid]["file"]) {
        term.echo(" ");
        term.echo("Attachment: http://ctf.upml.tech" + tasks[tid]["file"] + " | http://10.0.0.10" + tasks[tid]["file"]);
      }
      term.echo(" ");
      term.echo("Use [[b;white;black]post " + filename + " FLAG] to submit the flag");
    } else {
      term.echo("Selected file does not exist");
    }
  } else if (currentDirectory == '/' && cmd == 'scoreboard') {
    term.pause();
    term.echo("Please wait while scoreboard is loading..");
    window.location = 'http://ctf.upml.tech/scoreboard';
  } else if (currentDirectory == '/' && cmd.match(/^post/)) {
    if (cmd.match(/^post +UCTF[A-Za-z0-9]{20}/)) {
      term.echo("TODO: send queries");
    } else {
      term.echo("[[b;red;black]Warning!] This utility works only for Attack-Defense flags!");
      term.echo("If you want to submit task flags, go to [[b;white;black]tasks] directory");
      term.echo(" ");
      term.echo("Usage: [[b;white;black]post flag]");
      term.echo("[[b;white;black]flag] - private information from any team server");
      term.echo(" ");
      term.echo("If you want to automate sending flags, please send [[b;white;black]POST] queries to http://ctf.upml.tech/attack | http://10.0.0.10/attack.");
      term.echo("There must be two parameters: [[b;white;black]invite] and [[b;white;black]flag]");
      term.echo("See source code of client.handler.js for example of interaction.")
    }
  } else if (currentDirectory == '/tasks' && cmd.match(/^post/)) {
    if (cmd.match(/^post +[a-z]+[0-9]+ +[A-Za-z0-9_-]+/)) {
      values = cmd.match(/^post +([a-z]+[0-9]+) +([A-Za-z0-9_-]+)/);
      taskId = values[1];
      flag = values[2];
      if (taskIds[taskId]) {
        term.pause();
        $.post('/submit', {'invite': inviteCode, 'int_id': taskIds[taskId], 'flag': flag}, function(data) {
          if (data["error"]) {
            term.echo("[[;red;black]ERROR] " + data["description"]);
          } else {
            tasks[taskIds[taskId]]["solved"] = true;
            term.echo("[[;green;black]Congratulations!] Your submit is successful!");
          }
          term.resume();
        });
      } else {
        term.echo("[[;red;black]ERROR] Task with name [[b;white;black]" + taskId + "] does not exist!");
      }
    } else {
      term.echo("[[b;red;black]Warning!] This utility is only for Task flags!");
      term.echo("If you want to submit Attack-Defense flags, go to initial directory");
      term.echo(" ");
      term.echo("Usage: [[b;white;black]post task_name flag]");
      term.echo("[[b;white;black]task_name] - name of task given by [[b;white;black]ls] command");
      term.echo("[[b;white;black]flag] - answer for this task");
    }
  } else {
    term.echo("Command [[b;white;black]" + cmd + "] not found. Try to type [[b;white;black]help]");
  }
}

var terminalSettings = {
  prompt: 'somebody@upmlctf:/$ ',
  greetings: "[[b;white;black]UPML CTF] Checksystem\n\nType [[b;white;black]help] for list of available commands. Use the console and [[b;red;black]save the world!]. Note that by typing any command in this console, you confirm your full agreement with UPML CTF rules.\n"
};