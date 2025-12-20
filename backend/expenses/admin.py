from django.contrib import admin
from .models import Expense, MonthlyIncome, Budget

admin.site.register(Expense)
admin.site.register(MonthlyIncome)
admin.site.register(Budget)
