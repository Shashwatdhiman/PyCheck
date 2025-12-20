# imports
from datetime import date

from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import MonthlyIncome, Expense, Budget 
from .serializers import MonthlyIncomeSerializer, ExpenseSerializer, BudgetSerializer


from django.db.models import Sum
from datetime import date
from calendar import monthrange
from datetime import date

from .services import calculate_savings, update_savings_snapshot


# =========================
# SAVINGS VIEWS
# =========================

class SavingsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))

        savings = calculate_savings(request.user, year, month)

        return Response({
            "year": year,
            "month": month,
            "savings": savings
        })

# =========================
# INCOME VIEWS
# =========================

class MonthlyIncomeView(APIView):
    permission_classes = [IsAuthenticated]

    def get_current_month(self):
        today = date.today()
        return date(today.year, today.month, 1)

    def get(self, request):
        month = self.get_current_month()

        income = MonthlyIncome.objects.filter(
            user=request.user,
            month=month
        ).first()

        if not income:
            return Response(
                {"message": "No income set for this month"},
                status=status.HTTP_200_OK
            )

        serializer = MonthlyIncomeSerializer(income)
        return Response(serializer.data)

    def post(self, request):
        month = self.get_current_month()

        income, created = MonthlyIncome.objects.get_or_create(
            user=request.user,
            month=month,
            defaults={"amount": request.data.get("amount")}
        )

        if not created:
            income.amount = request.data.get("amount")
            income.save()

        serializer = MonthlyIncomeSerializer(income)
        return Response(serializer.data)


# =========================
# EXPENSE VIEWS
# =========================

class ExpenseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get_month_range(self, year, month):
        start_date = date(year, month, 1)

        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)

        return start_date, end_date

    def get(self, request):
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))

        start_date, end_date = self.get_month_range(year, month)

        expenses = Expense.objects.filter(
            user=request.user,
            date__gte=start_date,
            date__lt=end_date
        )

        serializer = ExpenseSerializer(expenses, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = ExpenseSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ExpenseUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, expense_id):
        try:
            expense = Expense.objects.get(
                id=expense_id,
                user=request.user
            )
        except Expense.DoesNotExist:
            return Response(
                {"error": "Expense not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = ExpenseSerializer(
            expense,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

class ExpenseDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, expense_id):
        try:
            expense = Expense.objects.get(
                id=expense_id,
                user=request.user
            )
        except Expense.DoesNotExist:
            return Response(
                {"error": "Expense not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        expense.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


# =========================
# DASHBOARD VIEWS
# =========================

class DashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get_month_range(self, year, month):
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
        return start_date, end_date


    def get(self, request):
        user = request.user
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))

        start_date, end_date = self.get_month_range(year, month)


        # -------- Income --------
        income_obj = MonthlyIncome.objects.filter(
            user=user,
            month=start_date
        ).first()

        income = income_obj.amount if income_obj else 0

        # -------- Expenses --------
        expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lt=end_date
        )

        total_spent = expenses.aggregate(
            total=Sum('amount')
        )['total'] or 0

        # -------- Category Breakdown --------
        category_breakdown_qs = (
            expenses
            .values('category')
            .annotate(total=Sum('amount'))
        )

        category_breakdown = {
            item['category']: item['total']
            for item in category_breakdown_qs
        }

        # -------- Budgets --------
        budgets = Budget.objects.filter(
            user=user,
            month=start_date
        )

        category_budgets = {}
        total_budget = 0
        # -------- Monthly Balance & Savings --------
        monthly_balance = income - total_spent

        snapshot = update_savings_snapshot(
            user=user,
            year=year,
            month=month
        )

        savings_balance = snapshot.savings_balance


        for budget in budgets:
            spent = category_breakdown.get(budget.category, 0)
            total_budget += budget.amount

            percentage = (
                round((spent / budget.amount) * 100, 2)
                if budget.amount > 0
                else 0
            )

            category_budgets[budget.category] = {
                "budget": budget.amount,
                "spent": spent,
                "percentage": percentage
            }

        # -------- Budget Summary --------
        budget_summary = {
            "total_budget": total_budget,
            "income": income,
            "difference": income - total_budget,
            "is_over_budgeted": total_budget > income
        }



        return Response({
            "income": income,
            "total_spent": total_spent,

            "monthly_balance": monthly_balance,
            "savings_balance": savings_balance,

            "category_breakdown": category_breakdown,
            "category_budgets": category_budgets,
            "budget_summary": budget_summary
        })





# =========================
# BUDGET VIEWS
# =========================

from datetime import date

class BudgetListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))

        month_start = date(year, month, 1)

        budgets = Budget.objects.filter(
            user=request.user,
            month=month_start
        )

        serializer = BudgetSerializer(budgets, many=True)
        return Response(serializer.data)

    def post(self, request):
        year = int(request.data.get("year", date.today().year))
        month = int(request.data.get("month", date.today().month))

        month_start = date(year, month, 1)

        serializer = BudgetSerializer(data=request.data)
        if serializer.is_valid():
            budget, created = Budget.objects.update_or_create(
                user=request.user,
                category=serializer.validated_data["category"],
                month=month_start,
                defaults={
                    "amount": serializer.validated_data["amount"]
                }
            )
            return Response(
                BudgetSerializer(budget).data,
                status=status.HTTP_200_OK
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BudgetDeleteView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, budget_id):
        try:
            budget = Budget.objects.get(
                id=budget_id,
                user=request.user
            )
        except Budget.DoesNotExist:
            return Response(
                {"error": "Budget not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        budget.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)



class BudgetUpdateView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, budget_id):
        try:
            budget = Budget.objects.get(
                id=budget_id,
                user=request.user
            )
        except Budget.DoesNotExist:
            return Response(
                {"error": "Budget not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BudgetSerializer(
            budget,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


# =========================
# RECURRING EXPENSES VIEWS
# =========================

class GenerateRecurringExpensesView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        today = date.today()
        year = today.year
        month = today.month

        created = 0

        recurring_expenses = Expense.objects.filter(
            user=request.user,
            is_recurring=True
        )

        for expense in recurring_expenses:
            # Use safe day (never exceed month length)
            last_day = monthrange(year, month)[1]
            day = min(expense.recurrence_day or 1, last_day)

            expense_date = date(year, month, day)

            already_exists = Expense.objects.filter(
                user=request.user,
                category=expense.category,
                amount=expense.amount,
                date=expense_date,
                note=expense.note
            ).exists()

            if not already_exists:
                Expense.objects.create(
                    user=request.user,
                    amount=expense.amount,
                    category=expense.category,
                    date=expense_date,
                    note=expense.note,
                    is_recurring=True,
                    recurrence_day=expense.recurrence_day
                )
                created += 1

        return Response(
            {"created": created},
            status=status.HTTP_200_OK
        )

# =========================
# INSIGHTS VIEWS
# =========================

class InsightsView(APIView):
    permission_classes = [IsAuthenticated]

    def get_month_range(self, year, month):
        start_date = date(year, month, 1)
        if month == 12:
            end_date = date(year + 1, 1, 1)
        else:
            end_date = date(year, month + 1, 1)
        return start_date, end_date

    def get(self, request):
        user = request.user
        year = int(request.query_params.get("year", date.today().year))
        month = int(request.query_params.get("month", date.today().month))

        start_date, end_date = self.get_month_range(year, month)

        # ---------- Current Month Expenses ----------
        current_expenses = Expense.objects.filter(
            user=user,
            date__gte=start_date,
            date__lt=end_date
        )

        current_total = current_expenses.aggregate(
            total=Sum("amount")
        )["total"] or 0

        # ---------- Previous Month ----------
        prev_month = month - 1 or 12
        prev_year = year - 1 if month == 1 else year
        prev_start, prev_end = self.get_month_range(prev_year, prev_month)

        prev_expenses = Expense.objects.filter(
            user=user,
            date__gte=prev_start,
            date__lt=prev_end
        )

        prev_total = prev_expenses.aggregate(
            total=Sum("amount")
        )["total"] or 0

        insights = []

        # 🔹 Insight 1: Month-over-Month
        if prev_total > 0:
            diff = current_total - prev_total
            percent = round((diff / prev_total) * 100, 1)

            insights.append({
                "type": "month_comparison",
                "severity": "warning" if diff > 0 else "positive",
                "message": f"You spent ₹{abs(diff)} ({abs(percent)}%) {'more' if diff > 0 else 'less'} than last month"
            })

        # ---------- Budgets ----------
        budgets = Budget.objects.filter(
            user=user,
            month=start_date
        )

        # 🔹 Insight 2 & 3
        income_obj = MonthlyIncome.objects.filter(
            user=user,
            month=start_date
        ).first()

        income = income_obj.amount if income_obj else 0

        for budget in budgets:
            spent = current_expenses.filter(
                category=budget.category
            ).aggregate(total=Sum("amount"))["total"] or 0

            percent = round((spent / budget.amount) * 100, 1) if budget.amount else 0

            if percent >= 90:
                insights.append({
                    "type": "budget_warning",
                    "severity": "danger",
                    "message": f"{budget.category.capitalize()} budget is at {percent}% usage"
                })

            if income and (budget.amount / income) >= 0.5:
                insights.append({
                    "type": "income_pressure",
                    "severity": "warning",
                    "message": f"{budget.category.capitalize()} consumes {round((budget.amount/income)*100)}% of your income"
                })

        # 🔹 Insight 4: Total budget exceeded
        total_budget = sum(b.amount for b in budgets)

        if income and total_budget > income:
            insights.append({
                "type": "over_budget",
                "severity": "danger",
                "message": "Your total budget exceeds your income"
            })

        return Response(insights)
