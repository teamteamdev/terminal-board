from django.db import models
from django.utils.timezone import now

class TeamParticipant(models.Model):
  first_name = models.CharField("First name", max_length = 40)
  last_name = models.CharField("Last name", max_length = 40)
  contact = models.TextField("Contact data", max_length = 400)
  team = models.ForeignKey("Team", on_delete = models.CASCADE, related_name = 'participants')
  
  def __str__(self):
    return "{0} {1}".format(self.first_name, self.last_name)
  
  class Meta:
    verbose_name = 'participant'

class Team(models.Model):
  name = models.CharField("Team name", max_length = 30)
  invite = models.CharField("Invite key", max_length = 12, unique = True)
  
  def __str__(self):
    parties = self.participants.all()
    return "{0} [{1}]".format(self.name, ", ".join(map(str, parties)))

class Service(models.Model):
  name = models.CharField("Name", max_length = 30)
  sup = models.PositiveIntegerField("Support cost")
  fine = models.PositiveIntegerField("Vuln fine")
  bounty = models.PositiveIntegerField("Bug bounty")
  
  def __str__(self):
    return self.name

class TeamService(models.Model):
  team = models.ForeignKey("Team", on_delete = models.CASCADE, related_name = 'services')
  service = models.ForeignKey("Service", on_delete = models.CASCADE, related_name = 'teamboxes')
  passed_checks = models.IntegerField("Passed checks")
  
  def __str__(self):
    return "{0}, {1}".format(self.team.name, self.service.name)

class StoredFlag(models.Model):
  box = models.ForeignKey("TeamService", on_delete = models.CASCADE, related_name = 'flags')
  token = models.CharField("Token", max_length = 500)
  flag = models.CharField("Flag", max_length = 24)
  
  def __str__(self): 
    return "{0}, {1}".format(self.flag, str(self.box))

class FlagSubmit(models.Model):
  attacker = models.ForeignKey("Team", on_delete = models.CASCADE, related_name = 'submitted')
  flag = models.ForeignKey("StoredFlag", on_delete = models.CASCADE, related_name='stolen_by')
  
  def __str__(self):
    return "{0} by {1}".format(str(self.flag), self.attacker.name)

class TaskCategory(models.Model):
  name = models.CharField("Name", max_length = 10)
  
  def __str__(self):
    return "{0} [{1} tasks]".format(self.name, len(self.tasks.all()))
  
  class Meta:
    verbose_name = 'task category'
    verbose_name_plural = 'task categories'

class Task(models.Model):
  name = models.CharField("Name", max_length = 30)
  text = models.TextField("Description", max_length = 250)
  points = models.PositiveIntegerField("Points")
  category = models.ForeignKey("TaskCategory", on_delete = models.CASCADE, related_name = 'tasks')
  flag = models.CharField("Flag", max_length = 32)
  file = models.FileField("File", upload_to = 'taskdata/', blank = True)
  
  def __str__(self):
    return "{0} [{1}{2}]".format(self.name, self.category.name, self.points)
    

class TaskSolution(models.Model):
  team = models.ForeignKey("Team", on_delete = models.CASCADE, related_name = 'solved_tasks')
  task = models.ForeignKey("Task", on_delete = models.CASCADE, related_name = 'solved_by')
  
  def __str__(self):
    return "{0} by {1}".format(self.task.name, self.team.name)

class ScoreEvent(models.Model):
  event_type = models.CharField("Event type", max_length = 40)
  item = models.CharField("Initiator", max_length = 40)
  description = models.CharField(max_length = 80)
  team = models.ForeignKey("Team", on_delete = models.CASCADE, related_name = 'events')
  delta = models.IntegerField("Points change")
  timestamp = models.DateTimeField("Change timestamp", default = now)
  
  def __str__(self):
    return "{0} d={1} ({2})".format(self.team.name, self.delta, self.event_type)

