from datetime import date
from django.db.models import Sum
from .models import MonthlyIncome, Expense, SavingsSnapshot

def calculate_savings(user, year, month):
    current_month = date(year, month, 1)

    prev_month = month - 1 or 12
    prev_year = year - 1 if month == 1 else year
    prev_date = date(prev_year, prev_month, 1)

    prev_snapshot = SavingsSnapshot.objects.filter(
        user=user,
        month=prev_date
    ).first()

    prev_savings = prev_snapshot.savings_balance if prev_snapshot else 0

    income = MonthlyIncome.objects.filter(
        user=user,
        month=current_month
    ).aggregate(total=Sum("amount"))["total"] or 0

    expenses = Expense.objects.filter(
        user=user,
        date__year=year,
        date__month=month
    ).aggregate(total=Sum("amount"))["total"] or 0

    return prev_savings + income - expenses

def update_savings_snapshot(user, year, month):
    month_start = date(year, month, 1)

    savings = calculate_savings(user, year, month)

    snapshot, _ = SavingsSnapshot.objects.update_or_create(
        user=user,
        month=month_start,
        defaults={"savings_balance": savings}
    )

    return snapshot
