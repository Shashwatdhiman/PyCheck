from rest_framework import serializers
from .models import Expense, MonthlyIncome, Budget


class MonthlyIncomeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MonthlyIncome
        fields = [
            'id',
            'month',
            'amount',
        ]


class ExpenseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Expense
        fields = [
            'id',
            'amount',
            'category',
            'date',
            'note',
            'is_recurring',
            'recurrence_day',
            'created_at',
        ]


class BudgetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Budget
        fields = [
            'id',
            'category',
            'amount',
        ]
