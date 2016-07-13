from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.http import HttpResponseRedirect, JsonResponse
from .models import *
from json import dumps

def login_web100(request):
  login = request.GET.get("login", "")
  password = request.GET.get("password", "")
  if login == "admin" and password == "admin":
    return render(request, "web100-login.html")
  else:
    return render(request, "web100-deny.html")

def get_team(invite):
  if invite == "": return (False, "empty-invite", "required parameter invite is empty")
  team = Team.objects.filter(invite=invite)
  if len(team) == 0: return (False, "invalid-invite", "no team with specified invite")
  return (team[0], )

def main(request):
  return render(request, "main.html")

def scoreboard(request):
  teams = sorted([
    {
      "name": team.name,
      "points": 3000 + sum([event.delta for event in ScoreEvent.objects.filter(team_id = team.id)])
    } for team in Team.objects.all()
  ], key = (lambda x: -x["points"]))
  return render(request, "board.html",{"teams": teams})

def tasks(request):
  team_data = get_team(request.GET.get("invite", ""))
  if not team_data[0]:
    return JsonResponse({"error": team_data[1], "description": team_data[2]})
  tid = team_data[0].pk
  data = []
  for category in TaskCategory.objects.all():
    tasklist = []
    tasks = category.tasks.all()
    for task in tasks:
      tasklist.append({
        "id": task.pk,
        "name": task.name,
        "text": task.text,
        "points": task.points,
        "file": task.file.url if task.file else "",
      })
    data.append({"name": category.name, "tasks": tasklist})
  return JsonResponse(data, safe = False)

def status(request):
  team_data = get_team(request.GET.get("invite", ""))
  if not team_data[0]:
    return JsonResponse({"error": team_data[1], "description": team_data[2]})
  tid = team_data[0].pk
  data = {task.pk: len(task.solved_by.filter(team_id = tid)) > 0 for task in Task.objects.all()}
  return JsonResponse(data, safe = False)

def auth(request):
  team_data = get_team(request.GET.get("invite", ""))
  if not team_data[0]:
    return JsonResponse({"error": team_data[1], "description": team_data[2]})
  team = team_data[0]
  return JsonResponse({"team_id": team.pk, "team_name": team.name})

@csrf_exempt
def submit_task(request):
  team_data = get_team(request.POST.get("invite", ""))
  if not team_data[0]:
    return JsonResponse({"error": team_data[1], "description": team_data[2], "post": request.POST}, safe = False)
  team = team_data[0]
  
  int_id = request.POST.get("int_id", "")
  try:
    int_id = int(int_id)
  except Exception as e:
    return JsonResponse({"error": "id-not-int", "description": "internal task id cannot be parsed as integer"})
  try:
    task = Task.objects.get(pk = int_id)
  except Exception as e:
    return JsonResponse({"error": "404", "description": "task does not exist"})
  
  flag = request.POST.get("flag", "")
  if len(flag) == 0:
    return JsonResponse({"error": "no-flag", "description": "flag is invalid or empty"})
  
  solutions = TaskSolution.objects.filter(team = team, task = task)
  if len(solutions) > 0:
    return JsonResponse({"error": "has-solution", "description": "this team already solved this task"})
  
  if task.flag.lower() == flag.lower():
    solution = TaskSolution(team = team, task = task)
    solution.save()
    score = ScoreEvent(
      event_type = "Task.Solved",
      item = "self", 
      description = "Team solved task {0}{1}".format(task.category.name, task.points), 
      team = team,
      delta = task.points)
    score.save()
    return JsonResponse({"status": "ok"})
  else:
    score = ScoreEvent(
      event_type = "Task.Wrong",
      item = "self", 
      description = "Team submitted wrong flag for task {0}{1}: \"{2}\"".format(task.category.name, task.points, flag), 
      team = team,
      delta = -task.points // 10)
    score.save()
    return JsonResponse({"error": "wrong-flag", "description": "flag is wrong, you lose {0} points".format(task.points // 10)})
