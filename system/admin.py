from django.contrib import admin
from .models import *

@admin.register(TeamParticipant)
class TeamParticipantAdmin(admin.ModelAdmin):
  pass

@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
  list_display = ("name", "invite")

@admin.register(Service)
class ServiceAdmin(admin.ModelAdmin):
  pass

@admin.register(TaskCategory)
class TaskCategoryAdmin(admin.ModelAdmin):
  pass

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
  pass

@admin.register(TaskSolution)
class TaskSolutionAdmin(admin.ModelAdmin):
  pass

@admin.register(ScoreEvent)
class ScoreEventAdmin(admin.ModelAdmin):
  pass
