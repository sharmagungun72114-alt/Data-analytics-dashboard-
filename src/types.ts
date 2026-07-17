export interface User {
  id: number;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface KPIStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  monthlyGrowth: number;
}

export interface SalesTrendItem {
  month: string;
  fullMonth: string;
  amount: number;
  count: number;
}

export interface CategoryRevenueItem {
  category: string;
  amount: number;
}

export interface CustomerDistributionItem {
  status: string;
  count: number;
}

export interface DashboardData {
  success: boolean;
  kpis: KPIStats;
  salesTrend: SalesTrendItem[];
  categoryRevenue: CategoryRevenueItem[];
  customerDistribution: CustomerDistributionItem[];
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  revenue: number;
  signup_date: string;
  status: string;
}

export interface Report {
  id: number;
  title: string;
  category: string;
  created_by: string;
  created_at: string;
  status: string;
  description: string;
}

export interface TopProduct {
  name: string;
  itemsSold: number;
  revenue: number;
}

export interface MonthlyBreakdown {
  month: string;
  revenue: number;
  items: number;
}

export interface AnalyticsData {
  success: boolean;
  topProducts: TopProduct[];
  averageTransaction: number;
  monthlyBreakdown: MonthlyBreakdown[];
}
