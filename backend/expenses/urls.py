from django.urls import path
from .views import (
    MonthlyIncomeView,
    ExpenseListCreateView,
    ExpenseDeleteView,
    DashboardView,
    BudgetListCreateView,
    GenerateRecurringExpensesView,
    ExpenseUpdateView,
    BudgetUpdateView,
    BudgetDeleteView,
    InsightsView,
    SavingsView,
    RegisterView
)

urlpatterns = [
    path('income/', MonthlyIncomeView.as_view()),

    path('expenses/', ExpenseListCreateView.as_view()),
    path('expenses/<int:expense_id>/', ExpenseDeleteView.as_view()),

    path('dashboard/', DashboardView.as_view()),

    path('budgets/', BudgetListCreateView.as_view()),
    path("expenses/generate-recurring/", GenerateRecurringExpensesView.as_view()),
    path("expenses/<int:expense_id>/update/", ExpenseUpdateView.as_view()),
    path("expenses/<int:expense_id>/delete/", ExpenseDeleteView.as_view()),
    path("budgets/<int:budget_id>/update/", BudgetUpdateView.as_view()),
    path("budgets/<int:budget_id>/delete/", BudgetDeleteView.as_view()),
    path("insights/", InsightsView.as_view()),
    path("savings/", SavingsView.as_view()),
    path("register/", RegisterView.as_view()),
]
