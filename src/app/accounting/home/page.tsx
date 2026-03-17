"use client";

import React from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ThemeToggle } from "@/components/canvasly/ThemeToggle";
import {
  PlaneTakeoffIcon,
  TrendingUpIcon,
  TrendingDownIcon,
  AlertTriangleIcon,
  ArrowLeftIcon,
  CreditCardIcon,
  StarIcon,
  AwardIcon,
} from "lucide-react";

// ── Mock Data ─────────────────────────────────────────────────────────────────

const programs = [
  {
    id: 1,
    name: "United MileagePlus",
    balance: 87_450,
    color: "hsl(var(--chart-1))",
    expiresIn: null,
  },
  {
    id: 2,
    name: "Delta SkyMiles",
    balance: 52_300,
    color: "hsl(var(--chart-2))",
    expiresIn: null,
  },
  {
    id: 3,
    name: "American AAdvantage",
    balance: 34_120,
    color: "hsl(var(--chart-4))",
    expiresIn: 62,
  },
  {
    id: 4,
    name: "Chase Ultimate Rewards",
    balance: 128_000,
    color: "hsl(var(--chart-3))",
    expiresIn: null,
  },
  {
    id: 5,
    name: "Amex Membership Rewards",
    balance: 76_500,
    color: "hsl(var(--chart-5))",
    expiresIn: null,
  },
];

const totalMiles = programs.reduce((sum, p) => sum + p.balance, 0);

const recentTransactions = [
  {
    id: 1,
    date: "Mar 15, 2026",
    description: "Chase Sapphire Preferred — Monthly Bonus",
    program: "Chase Ultimate Rewards",
    type: "earned" as const,
    amount: 3_500,
  },
  {
    id: 2,
    date: "Mar 12, 2026",
    description: "United Flight ORD → SFO",
    program: "United MileagePlus",
    type: "earned" as const,
    amount: 1_842,
  },
  {
    id: 3,
    date: "Mar 10, 2026",
    description: "Award Booking — NYC → London",
    program: "American AAdvantage",
    type: "redeemed" as const,
    amount: 55_000,
  },
  {
    id: 4,
    date: "Mar 8, 2026",
    description: "Delta Flight ATL → LAX",
    program: "Delta SkyMiles",
    type: "earned" as const,
    amount: 2_210,
  },
  {
    id: 5,
    date: "Mar 5, 2026",
    description: "Amex Everyday Purchases",
    program: "Amex Membership Rewards",
    type: "earned" as const,
    amount: 4_100,
  },
  {
    id: 6,
    date: "Feb 28, 2026",
    description: "Hotel Stay — Marriott Bonvoy Transfer",
    program: "Chase Ultimate Rewards",
    type: "redeemed" as const,
    amount: 12_000,
  },
  {
    id: 7,
    date: "Feb 22, 2026",
    description: "United Flight LHR → ORD",
    program: "United MileagePlus",
    type: "earned" as const,
    amount: 4_320,
  },
];

const monthlyEarning = [
  { month: "Sep", earned: 18_200, redeemed: 0 },
  { month: "Oct", earned: 22_400, redeemed: 55_000 },
  { month: "Nov", earned: 31_500, redeemed: 12_000 },
  { month: "Dec", earned: 45_800, redeemed: 30_000 },
  { month: "Jan", earned: 27_300, redeemed: 0 },
  { month: "Feb", earned: 34_100, redeemed: 12_000 },
  { month: "Mar", earned: 11_652, redeemed: 0 },
];

const programBreakdown = programs.map((p) => ({
  name: p.name.split(" ")[0],
  miles: p.balance,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatMiles(n: number) {
  return n.toLocaleString();
}

const earnedThisMonth = recentTransactions
  .filter((t) => t.type === "earned" && t.date.startsWith("Mar"))
  .reduce((s, t) => s + t.amount, 0);

const redeemedThisMonth = recentTransactions
  .filter((t) => t.type === "redeemed" && t.date.startsWith("Mar"))
  .reduce((s, t) => s + t.amount, 0);

const expiringSoon = programs.filter((p) => p.expiresIn !== null);

// ── Page Component ────────────────────────────────────────────────────────────

export default function AccountingHomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Top Header */}
      <header className="bg-card border-b border-border shadow-sm h-14 flex items-center justify-between px-4 md:px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="icon" className="cursor-default">
              <ArrowLeftIcon className="h-5 w-5" />
              <span className="sr-only">Back to TripBoard</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <PlaneTakeoffIcon className="h-5 w-5 text-primary" />
            <span className="font-semibold text-lg">Miles Accounting</span>
          </div>
        </div>
        <ThemeToggle className="cursor-default" />
      </header>

      {/* Main Content */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
        {/* Page Title */}
        <div>
          <h1 className="text-2xl font-bold">Accounting Home</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track your miles &amp; points across all loyalty programs.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <AwardIcon className="h-4 w-4" />
                Total Miles Balance
              </CardDescription>
              <CardTitle className="text-3xl text-primary">
                {formatMiles(totalMiles)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                Across {programs.length} programs
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingUpIcon className="h-4 w-4 text-green-500" />
                Earned This Month
              </CardDescription>
              <CardTitle className="text-3xl text-green-600 dark:text-green-400">
                +{formatMiles(earnedThisMonth)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                March 2026
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <TrendingDownIcon className="h-4 w-4 text-orange-500" />
                Redeemed This Month
              </CardDescription>
              <CardTitle className="text-3xl text-orange-600 dark:text-orange-400">
                -{formatMiles(redeemedThisMonth)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                March 2026
              </p>
            </CardContent>
          </Card>

          <Card className={expiringSoon.length > 0 ? "border-destructive/50" : ""}>
            <CardHeader className="pb-2">
              <CardDescription className="flex items-center gap-1">
                <AlertTriangleIcon
                  className={`h-4 w-4 ${expiringSoon.length > 0 ? "text-destructive" : ""}`}
                />
                Expiring Soon
              </CardDescription>
              <CardTitle
                className={`text-3xl ${expiringSoon.length > 0 ? "text-destructive" : ""}`}
              >
                {expiringSoon.length > 0
                  ? formatMiles(expiringSoon.reduce((s, p) => s + p.balance, 0))
                  : "None"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {expiringSoon.length > 0 ? (
                <p className="text-xs text-destructive">
                  {expiringSoon[0].name} — expires in {expiringSoon[0].expiresIn} days
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">No miles expiring soon</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Monthly Earning / Spending Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Monthly Trend</CardTitle>
              <CardDescription>Miles earned vs redeemed (last 7 months)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={monthlyEarning} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="earnedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="redeemedGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatMiles(value), ""]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Area
                    type="monotone"
                    dataKey="earned"
                    name="Earned"
                    stroke="hsl(var(--chart-3))"
                    fill="url(#earnedGrad)"
                    strokeWidth={2}
                  />
                  <Area
                    type="monotone"
                    dataKey="redeemed"
                    name="Redeemed"
                    stroke="hsl(var(--chart-4))"
                    fill="url(#redeemedGrad)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Balance by Program */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Balance by Program</CardTitle>
              <CardDescription>Current miles per loyalty program</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={programBreakdown}
                  margin={{ top: 5, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number) => [formatMiles(value), "Miles"]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "var(--radius)",
                      color: "hsl(var(--foreground))",
                      fontSize: 12,
                    }}
                  />
                  <Bar dataKey="miles" name="Miles" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Program Balances */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCardIcon className="h-4 w-4" />
              Loyalty Programs
            </CardTitle>
            <CardDescription>Your miles &amp; points balances at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {programs.map((program) => (
              <div key={program.id} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span
                      className="inline-block h-2.5 w-2.5 rounded-full"
                      style={{ background: program.color }}
                    />
                    <span className="font-medium">{program.name}</span>
                    {program.expiresIn !== null && (
                      <Badge variant="destructive" className="text-xs">
                        Expires in {program.expiresIn}d
                      </Badge>
                    )}
                  </div>
                  <span className="font-semibold tabular-nums">
                    {formatMiles(program.balance)}
                  </span>
                </div>
                <Progress
                  value={(program.balance / totalMiles) * 100}
                  className="h-1.5"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <StarIcon className="h-4 w-4" />
              Recent Transactions
            </CardTitle>
            <CardDescription>
              Latest miles earned and redeemed across all programs
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="hidden md:table-cell">Program</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions.map((tx) => (
                  <TableRow key={tx.id}>
                    <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                      {tx.date}
                    </TableCell>
                    <TableCell className="font-medium text-sm">
                      {tx.description}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-sm text-muted-foreground">
                      {tx.program}
                    </TableCell>
                    <TableCell className="text-right">
                      <span
                        className={`font-semibold tabular-nums ${
                          tx.type === "earned"
                            ? "text-green-600 dark:text-green-400"
                            : "text-orange-600 dark:text-orange-400"
                        }`}
                      >
                        {tx.type === "earned" ? "+" : "-"}
                        {formatMiles(tx.amount)}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
