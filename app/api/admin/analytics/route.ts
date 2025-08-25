import { NextResponse } from 'next/server';
import { getOrders, getProducts } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get('period') || '7d';
  
  const orders = await getOrders();
  const products = await getProducts();
  
  // 期間に基づいてフィルタリング
  const now = new Date();
  let startDate = new Date();
  
  switch (period) {
    case '24h':
      startDate.setDate(now.getDate() - 1);
      break;
    case '7d':
      startDate.setDate(now.getDate() - 7);
      break;
    case '30d':
      startDate.setDate(now.getDate() - 30);
      break;
    case '90d':
      startDate.setDate(now.getDate() - 90);
      break;
    case '1y':
      startDate.setFullYear(now.getFullYear() - 1);
      break;
    default:
      startDate.setDate(now.getDate() - 7);
  }
  
  const filteredOrders = orders.filter(order => 
    new Date(order.createdAt) >= startDate
  );
  
  // 日別売上データを生成
  const dailySales: { [key: string]: number } = {};
  const dailyOrders: { [key: string]: number } = {};
  
  filteredOrders.forEach(order => {
    const date = new Date(order.createdAt).toISOString().split('T')[0];
    dailySales[date] = (dailySales[date] || 0) + order.total;
    dailyOrders[date] = (dailyOrders[date] || 0) + 1;
  });
  
  // チャート用データの整形
  const chartData = Object.keys(dailySales).map(date => ({
    date,
    sales: dailySales[date],
    orders: dailyOrders[date]
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  // 商品別売上データを集計
  const productSales: { [key: string]: { name: string; quantity: number; revenue: number } } = {};
  
  filteredOrders.forEach(order => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: any) => {
        const productId = item.productId;
        if (!productSales[productId]) {
          productSales[productId] = {
            name: item.productName || 'Unknown',
            quantity: 0,
            revenue: 0
          };
        }
        productSales[productId].quantity += item.quantity || 1;
        productSales[productId].revenue += (item.price || 0) * (item.quantity || 1);
      });
    }
  });
  
  // トップ商品を取得
  const topProducts = Object.entries(productSales)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);
  
  // 時間帯別売上分析
  const hourlyStats: { [key: number]: { orders: number; revenue: number } } = {};
  
  filteredOrders.forEach(order => {
    const hour = new Date(order.createdAt).getHours();
    if (!hourlyStats[hour]) {
      hourlyStats[hour] = { orders: 0, revenue: 0 };
    }
    hourlyStats[hour].orders += 1;
    hourlyStats[hour].revenue += order.total;
  });
  
  const hourlyData = Object.entries(hourlyStats).map(([hour, stats]) => ({
    hour: parseInt(hour),
    ...stats
  })).sort((a, b) => a.hour - b.hour);
  
  // サマリー統計
  const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.total, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  
  // 利益計算（原価率50%として計算）
  const costRate = 0.5;
  const totalCost = totalRevenue * costRate;
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
  
  // 前期間との比較
  let previousStartDate = new Date(startDate);
  let previousEndDate = new Date(startDate);
  
  switch (period) {
    case '24h':
      previousStartDate.setDate(previousStartDate.getDate() - 1);
      break;
    case '7d':
      previousStartDate.setDate(previousStartDate.getDate() - 7);
      break;
    case '30d':
      previousStartDate.setDate(previousStartDate.getDate() - 30);
      break;
    case '90d':
      previousStartDate.setDate(previousStartDate.getDate() - 90);
      break;
    case '1y':
      previousStartDate.setFullYear(previousStartDate.getFullYear() - 1);
      break;
  }
  
  const previousOrders = orders.filter(order => {
    const orderDate = new Date(order.createdAt);
    return orderDate >= previousStartDate && orderDate < previousEndDate;
  });
  
  const previousRevenue = previousOrders.reduce((sum, order) => sum + order.total, 0);
  const previousProfit = previousRevenue * (1 - costRate);
  const revenueGrowth = previousRevenue > 0 
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
    : 0;
  
  const orderGrowth = previousOrders.length > 0
    ? ((totalOrders - previousOrders.length) / previousOrders.length) * 100
    : 0;
    
  const profitGrowth = previousProfit > 0
    ? ((totalProfit - previousProfit) / previousProfit) * 100
    : 0;
  
  // 日別利益データを生成
  const dailyProfits: { [key: string]: number } = {};
  Object.keys(dailySales).forEach(date => {
    dailyProfits[date] = dailySales[date] * (1 - costRate);
  });
  
  // チャート用データに利益を追加
  const enhancedChartData = Object.keys(dailySales).map(date => ({
    date,
    sales: dailySales[date],
    profit: dailyProfits[date],
    orders: dailyOrders[date]
  })).sort((a, b) => a.date.localeCompare(b.date));
  
  // 商品別利益を計算
  const topProductsWithProfit = topProducts.map(product => ({
    ...product,
    cost: product.revenue * costRate,
    profit: product.revenue * (1 - costRate),
    profitMargin: ((product.revenue * (1 - costRate)) / product.revenue) * 100,
    averagePrice: product.quantity > 0 ? product.revenue / product.quantity : 0
  }));
  
  // コンバージョン率の計算（仮定: ページビューの2%が購入）
  const estimatedPageViews = totalOrders * 50; // 一般的なECサイトのCVR 2%と仮定
  const conversionRate = totalOrders > 0 ? (totalOrders / estimatedPageViews) * 100 : 0;
  
  // リピート購入の分析（同じメールアドレスの注文をカウント）
  const customerOrders: { [email: string]: number } = {};
  filteredOrders.forEach(order => {
    if (order.customerEmail) {
      customerOrders[order.customerEmail] = (customerOrders[order.customerEmail] || 0) + 1;
    }
  });
  
  const repeatCustomers = Object.values(customerOrders).filter(count => count > 1).length;
  const totalCustomers = Object.keys(customerOrders).length;
  const repeatRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;
  
  // 週間・曜日別分析
  const weekdayStats: { [key: string]: { orders: number; revenue: number } } = {
    '日': { orders: 0, revenue: 0 },
    '月': { orders: 0, revenue: 0 },
    '火': { orders: 0, revenue: 0 },
    '水': { orders: 0, revenue: 0 },
    '木': { orders: 0, revenue: 0 },
    '金': { orders: 0, revenue: 0 },
    '土': { orders: 0, revenue: 0 }
  };
  
  const weekdays = ['日', '月', '火', '水', '木', '金', '土'];
  filteredOrders.forEach(order => {
    const day = weekdays[new Date(order.createdAt).getDay()];
    weekdayStats[day].orders += 1;
    weekdayStats[day].revenue += order.total;
  });
  
  const weekdayData = Object.entries(weekdayStats).map(([day, stats]) => ({
    day,
    ...stats,
    averageOrderValue: stats.orders > 0 ? stats.revenue / stats.orders : 0
  }));
  
  // カート放棄率の推定（仮定値）
  const estimatedCartAbandonment = 70; // 業界平均値
  
  // LTV（顧客生涯価値）の簡易計算
  const averageCustomerOrders = totalOrders / (totalCustomers || 1);
  const estimatedLTV = averageOrderValue * averageCustomerOrders * 3; // 3回の平均購入を想定
  
  return NextResponse.json({
    summary: {
      totalRevenue,
      totalOrders,
      averageOrderValue,
      totalCost,
      totalProfit,
      profitMargin: Math.round(profitMargin * 10) / 10,
      revenueGrowth: Math.round(revenueGrowth * 10) / 10,
      orderGrowth: Math.round(orderGrowth * 10) / 10,
      profitGrowth: Math.round(profitGrowth * 10) / 10,
      period,
      conversionRate: Math.round(conversionRate * 100) / 100,
      repeatRate: Math.round(repeatRate * 10) / 10,
      totalCustomers,
      repeatCustomers,
      cartAbandonment: estimatedCartAbandonment,
      estimatedLTV: Math.round(estimatedLTV)
    },
    chartData: enhancedChartData,
    topProducts: topProductsWithProfit,
    hourlyData,
    weekdayData,
    periodLabel: getPeriodLabel(period)
  });
}

function getPeriodLabel(period: string): string {
  switch (period) {
    case '24h': return '過去24時間';
    case '7d': return '過去7日間';
    case '30d': return '過去30日間';
    case '90d': return '過去90日間';
    case '1y': return '過去1年間';
    default: return '過去7日間';
  }
}