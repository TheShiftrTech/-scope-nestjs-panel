import { useEffect, useMemo, useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Activity,
  DollarSign,
  Package,
  Ticket,
  TrendingUp,
  Users,
} from 'lucide-react';
import { api } from '@/lib/api';
import { formatDatetime } from '@/lib/utils';
import type { PanelModuleMeta } from '@/generated/manifest.types';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface MetricPoint {
  label: string;
  value: number;
}

interface NamedValue {
  name: string;
  value: number;
}

interface DashboardOverview {
  generatedAt?: string;
  summary?: {
    totalUsers?: number;
    totalProducts?: number;
    activeSessions?: number;
    revenue?: number;
    growthPercent?: number;
    openTickets?: number;
  };
  series?: {
    usersOverTime?: MetricPoint[];
    revenueOverTime?: MetricPoint[];
    trafficBySource?: NamedValue[];
  };
  recentActivity?: Array<{
    id: string;
    type: string;
    message: string;
    at: string;
  }>;
}

interface DashboardPageProps {
  module: PanelModuleMeta;
}

const PIE_COLORS = ['#0ea5e9', '#38bdf8', '#64748b', '#94a3b8', '#0369a1'];

function formatNumber(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat().format(value);
}

function formatCurrency(value: number | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function DashboardPage({ module }: DashboardPageProps) {
  const list = module.list;
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!list) {
      return;
    }

    setLoading(true);
    setError('');
    api
      .get<DashboardOverview>(list.path)
      .then(setData)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, [list]);

  const summary = data?.summary;
  const series = data?.series;
  const activity = data?.recentActivity ?? [];

  const stats = useMemo(
    () => [
      {
        label: 'Users',
        value: formatNumber(summary?.totalUsers),
        hint: 'Total registered',
        icon: Users,
      },
      {
        label: 'Products',
        value: formatNumber(summary?.totalProducts),
        hint: 'Catalog size',
        icon: Package,
      },
      {
        label: 'Sessions',
        value: formatNumber(summary?.activeSessions),
        hint: 'Active now',
        icon: Activity,
      },
      {
        label: 'Revenue',
        value: formatCurrency(summary?.revenue),
        hint:
          summary?.growthPercent != null
            ? `${summary.growthPercent > 0 ? '+' : ''}${summary.growthPercent}% MoM`
            : 'This period',
        icon: DollarSign,
      },
      {
        label: 'Growth',
        value:
          summary?.growthPercent != null
            ? `${summary.growthPercent > 0 ? '+' : ''}${summary.growthPercent}%`
            : '—',
        hint: 'Month over month',
        icon: TrendingUp,
      },
      {
        label: 'Tickets',
        value: formatNumber(summary?.openTickets),
        hint: 'Open support',
        icon: Ticket,
      },
    ],
    [summary],
  );

  if (!list) {
    return (
      <p className="text-muted-foreground">No dashboard endpoint configured.</p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{list.title}</h2>
        {(list.description || module.description) && (
          <p className="mt-1 text-sm text-muted-foreground">
            {list.description ?? module.description}
          </p>
        )}
        {data?.generatedAt && (
          <p className="mt-1 text-xs text-muted-foreground">
            Updated {formatDatetime(data.generatedAt)}
          </p>
        )}
      </div>

      {loading && <p className="text-muted-foreground">Loading dashboard…</p>}
      {error && <p className="text-destructive">{error}</p>}

      {!loading && !error && data && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card key={stat.label}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      {stat.label}
                    </CardTitle>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <p className="text-xs text-muted-foreground">{stat.hint}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Users this week</CardTitle>
                <CardDescription>New signups by day</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series?.usersOverTime ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={36} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Revenue this week</CardTitle>
                <CardDescription>Daily revenue trend</CardDescription>
              </CardHeader>
              <CardContent className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={series?.revenueOverTime ?? []}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} width={40} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      fill="hsl(var(--primary))"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Traffic by source</CardTitle>
                <CardDescription>Share of inbound traffic</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex h-64 items-center gap-4">
                  <div className="h-full min-w-0 flex-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={series?.trafficBySource ?? []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          innerRadius={50}
                          outerRadius={80}
                          paddingAngle={3}
                        >
                          {(series?.trafficBySource ?? []).map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={PIE_COLORS[index % PIE_COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number, name: string) => [
                            value,
                            name,
                          ]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="w-36 shrink-0 space-y-2.5">
                    {(series?.trafficBySource ?? []).map((item, index) => {
                      const total = (series?.trafficBySource ?? []).reduce(
                        (sum, row) => sum + row.value,
                        0,
                      );
                      const pct =
                        total > 0 ? Math.round((item.value / total) * 100) : 0;
                      return (
                        <li
                          key={item.name}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <span className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor:
                                  PIE_COLORS[index % PIE_COLORS.length],
                              }}
                            />
                            <span className="truncate text-muted-foreground">
                              {item.name}
                            </span>
                          </span>
                          <span className="shrink-0 font-medium tabular-nums">
                            {pct}%
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
                <CardDescription>Latest events across the system</CardDescription>
              </CardHeader>
              <CardContent>
                {activity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity.</p>
                ) : (
                  <ul className="space-y-3">
                    {activity.map((item) => (
                      <li
                        key={item.id}
                        className="flex items-start justify-between gap-3 border-b border-border pb-3 last:border-0 last:pb-0"
                      >
                        <div className="min-w-0">
                          <div className="mb-1">
                            <Badge variant="secondary">{item.type}</Badge>
                          </div>
                          <p className="text-sm">{item.message}</p>
                        </div>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {formatDatetime(item.at)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
