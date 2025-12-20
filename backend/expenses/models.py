from django.db import models
from django.contrib.auth.models import User
from datetime import date


class MonthlyIncome(models.Model):
    """
    Stores user's income for a given month.
    One income per user per month.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.DateField(help_text="Use the first day of the month")
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        unique_together = ('user', 'month')
        ordering = ['-month']

    def __str__(self):
        return f"{self.user.username} - {self.month} - {self.amount}"


class Expense(models.Model):
    """
    Stores individual expense entries.
    """

    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('shopping', 'Shopping'),
        ('rent', 'Rent'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    date = models.DateField()
    note = models.TextField(blank=True)

    # Upgrade-ready fields
    is_recurring = models.BooleanField(default=False)
    recurrence_day = models.PositiveSmallIntegerField(
        null=True, blank=True,
        help_text="Day of month for recurring expense (1–28 recommended)"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"{self.user.username} - {self.category} - {self.amount}"


class Budget(models.Model):
    CATEGORY_CHOICES = [
        ('food', 'Food'),
        ('travel', 'Travel'),
        ('shopping', 'Shopping'),
        ('rent', 'Rent'),
        ('other', 'Other'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    amount = models.DecimalField(max_digits=10, decimal_places=2)

    # ✅ Monthly budget
    month = models.DateField(
        default=date.today().replace(day=1),
        help_text="First day of the month this budget applies to"
    )

    # ✅ Safe for existing rows
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "category", "month")

    def __str__(self):
        return f"{self.user} - {self.category} - {self.month}"



# Savings tracking model
class SavingsSnapshot(models.Model):
    """
    Tracks monthly savings balance for users.
    """
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    month = models.DateField()  # first day of month
    savings_balance = models.DecimalField(max_digits=12, decimal_places=2)

    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user", "month")
        ordering = ["month"]

    def __str__(self):
        return f"{self.user} - {self.month} - {self.savings_balance}"
