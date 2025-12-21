from rest_framework import serializers
from .models import Expense, MonthlyIncome, Budget
from django.contrib.auth.models import User

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

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ("username", "password")

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )
        return user
