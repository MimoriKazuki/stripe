import { NextRequest, NextResponse } from 'next/server';
import { getCustomers, getOrders, createOrUpdateCustomer } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search');
    
    const customers = await getCustomers();
    const orders = await getOrders();
    
    // 各顧客の注文情報を集計
    const enrichedCustomers = customers.map(customer => {
      const customerOrders = orders.filter(o => o.customerEmail === customer.email);
      const totalSpent = customerOrders.reduce((sum, o) => sum + o.total, 0);
      const lastOrder = customerOrders.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];
      
      return {
        ...customer,
        totalOrders: customerOrders.length,
        totalSpent,
        lastOrderDate: lastOrder?.createdAt,
        averageOrderValue: customerOrders.length > 0 ? totalSpent / customerOrders.length : 0
      };
    });
    
    let filteredCustomers = enrichedCustomers;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredCustomers = enrichedCustomers.filter(c => 
        c.email.toLowerCase().includes(searchLower) ||
        c.name.toLowerCase().includes(searchLower) ||
        c.phone?.includes(search)
      );
    }
    
    // 統計情報
    const stats = {
      totalCustomers: customers.length,
      newCustomersThisMonth: customers.filter(c => {
        const createdDate = new Date(c.createdAt);
        const now = new Date();
        return createdDate.getMonth() === now.getMonth() && 
               createdDate.getFullYear() === now.getFullYear();
      }).length,
      repeatCustomers: enrichedCustomers.filter(c => c.totalOrders > 1).length,
      averageLifetimeValue: enrichedCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / (customers.length || 1)
    };
    
    return NextResponse.json({
      customers: filteredCustomers,
      stats
    });
  } catch (error) {
    console.error('Error fetching customers:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const customerData = await req.json();
    const customer = await createOrUpdateCustomer(customerData);
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Error creating/updating customer:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}