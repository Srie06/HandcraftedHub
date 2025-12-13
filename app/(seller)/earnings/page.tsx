"use client";

import { useAuth } from "@/contexts/auth-context";
import ProtectedRoute from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Download,
  Calendar,
  CreditCard,
} from "lucide-react";

/**
 * Earnings Page - Seller Financial Overview
 */
function EarningsContent() {
  const { userProfile } = useAuth();

  // Mock earnings data - Replace with real Firebase data
  const earnings = {
    totalEarnings: 0,
    thisWeek: 0,
    thisMonth: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    commission: 0,
  };

  const transactions = [
    // Mock transaction data
  ];

  return (
    <div>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Earnings */}
        <Card className="rounded-xl shadow-soft bg-gradient-to-br from-green-50 to-emerald-50">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Total Earnings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-700">
              ${earnings.totalEarnings.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              All-time revenue
            </p>
          </CardContent>
        </Card>

        {/* This Month */}
        <Card className="rounded-xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ${earnings.thisMonth.toFixed(2)}
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+0%</span>
              <span className="text-muted-foreground ml-2">vs last month</span>
            </div>
          </CardContent>
        </Card>

        {/* This Week */}
        <Card className="rounded-xl shadow-soft">
          <CardHeader>
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ${earnings.thisWeek.toFixed(2)}
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">+0%</span>
              <span className="text-muted-foreground ml-2">vs last week</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payouts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Pending Payouts */}
        <Card className="rounded-xl shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-yellow-600" />
              Pending Payouts
            </CardTitle>
            <CardDescription>Awaiting transfer to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">
              ${earnings.pendingPayouts.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Expected payout in 3-5 business days
            </p>
          </CardContent>
        </Card>

        {/* Completed Payouts */}
        <Card className="rounded-xl shadow-soft">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2 text-green-600" />
              Completed Payouts
            </CardTitle>
            <CardDescription>Successfully transferred</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              ${earnings.completedPayouts.toFixed(2)}
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Total amount received
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Commission Breakdown */}
      <Card className="rounded-xl shadow-soft mb-8">
        <CardHeader>
          <CardTitle>Commission Breakdown</CardTitle>
          <CardDescription>Platform fees and your net earnings</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-muted/50 rounded-lg">
              <span className="font-medium">Gross Revenue</span>
              <span className="text-lg font-bold">
                ${earnings.totalEarnings.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
              <span className="font-medium text-red-700">
                Platform Commission (10%)
              </span>
              <span className="text-lg font-bold text-red-700">
                -${earnings.commission.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
              <span className="font-medium text-green-700">Net Earnings</span>
              <span className="text-2xl font-bold text-green-700">
                ${(earnings.totalEarnings - earnings.commission).toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card className="rounded-xl shadow-soft">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>
                View all your earnings and payouts
              </CardDescription>
            </div>
            <Button variant="outline" className="rounded-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <DollarSign className="h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                No transactions yet
              </h3>
              <p className="text-muted-foreground max-w-md">
                Your transaction history will appear here once you start
                receiving orders.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((transaction: any, index: number) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                      <DollarSign className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {transaction.date}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">
                      +${transaction.amount.toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {transaction.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function EarningsPage() {
  return (
    <ProtectedRoute requireSeller={true}>
      <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2 text-amber-900">
              Earnings Overview
            </h1>
            <p className="text-amber-800/70">
              Track your revenue and manage payouts
            </p>
          </div>

          <EarningsContent />
        </div>
      </main>
    </ProtectedRoute>
  );
}
