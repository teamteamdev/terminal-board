var tasks = {};
var taskIds = {};
var taskCats = {};

function display(id) {
  return tasks[id]["category"] + tasks[id]["points"];
}

function updateSolved(echoSuccess = true) {
  $.get('/status', {'invite': inviteCode}, function(data) {
    if (data["error"]) {
      $('#container').terminal().echo('[[;red;black]ERROR] Could not update tasks state: ' + data["description"]);
    } else {
      $.each(data, function(task_id, state) {
        if (tasks[task_id]["solved"] != state) {
          if (echoSuccess) $('#container').terminal().echo('[[;green;black]SUCCESS] Your team solved task ' + display(task_id));
          tasks[task_id]["solved"] = state;
        }
      });
    }
  });
  setTimeout(updateSolved, 5000);
}

function fetchTasks() {
  $.get('/tasks', {'invite': inviteCode}, function(data) {
    if (data["error"]) {
      $('#container').terminal().echo('[[;red;black]ERROR] Could not fetch tasks from system: ' + data["description"]);
    } else {
      $.each(data, function(idx, tasktype){
        taskCats[tasktype["name"]] = [];
        $.each(tasktype["tasks"], function(idx2, task) {
          tasks[task["id"]] = task;
          taskCats[tasktype["name"]].push(task["points"]);
          tasks[task["id"]]["category"] = tasktype["name"];
          tasks[task["id"]]["solved"] = false;
          taskIds[display(task["id"])] = task["id"];
        });
        taskCats[tasktype["name"]].sort(function(a,b){return b-a;});            
      });
      updateSolved(false);
    }
  })
}