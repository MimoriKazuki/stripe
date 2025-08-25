import fs from 'fs/promises';
import path from 'path';

const PRODUCTS_FILE = path.join(process.cwd(), 'data', 'products.json');
const ORDERS_FILE = path.join(process.cwd(), 'data', 'orders.json');

export interface DBProduct {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  currency: string;
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  stripeSessionId: string;
  customerEmail: string;
  customerName?: string;
  customerPhone?: string;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  billingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
  };
  shippingOption?: string;
  shippingCost?: number;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'unfulfilled' | 'partially_fulfilled' | 'fulfilled' | 'shipped' | 'delivered' | 'returned';
  trackingNumber?: string;
  trackingUrl?: string;
  shippingCarrier?: string;
  estimatedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
  tags?: string[];
  discountCode?: string;
  discountAmount?: number;
  createdAt: string;
  updatedAt: string;
}

// Products
export async function getProducts(): Promise<DBProduct[]> {
  try {
    const data = await fs.readFile(PRODUCTS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json.products;
  } catch (error) {
    console.error('Error reading products:', error);
    return [];
  }
}

export async function getActiveProducts(): Promise<DBProduct[]> {
  const products = await getProducts();
  return products.filter(p => p.active && p.stock > 0);
}

export async function getProduct(id: string): Promise<DBProduct | null> {
  const products = await getProducts();
  return products.find(p => p.id === id) || null;
}

export async function updateProduct(id: string, updates: Partial<DBProduct>): Promise<boolean> {
  try {
    const products = await getProducts();
    const index = products.findIndex(p => p.id === id);
    
    if (index === -1) return false;
    
    products[index] = {
      ...products[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(PRODUCTS_FILE, JSON.stringify({ products }, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating product:', error);
    return false;
  }
}

export async function createProduct(product: Omit<DBProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<DBProduct> {
  const products = await getProducts();
  const newProduct: DBProduct = {
    ...product,
    id: `prod_${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  products.push(newProduct);
  await fs.writeFile(PRODUCTS_FILE, JSON.stringify({ products }, null, 2));
  return newProduct;
}

export async function decrementStock(productId: string, quantity: number): Promise<boolean> {
  const product = await getProduct(productId);
  if (!product || product.stock < quantity) return false;
  
  return await updateProduct(productId, { stock: product.stock - quantity });
}

// Orders
export async function getOrders(): Promise<Order[]> {
  try {
    const data = await fs.readFile(ORDERS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json.orders;
  } catch (error) {
    console.error('Error reading orders:', error);
    return [];
  }
}

export async function createOrder(order: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Promise<Order> {
  const orders = await getOrders();
  const orderCount = orders.length + 1;
  const newOrder: Order = {
    ...order,
    id: `order_${Date.now()}`,
    orderNumber: `ORD-${String(orderCount).padStart(6, '0')}`,
    paymentStatus: order.paymentStatus || 'pending',
    fulfillmentStatus: order.fulfillmentStatus || 'unfulfilled',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  orders.push(newOrder);
  await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders }, null, 2));
  return newOrder;
}

export async function updateOrder(id: string, updates: Partial<Order>): Promise<boolean> {
  try {
    const orders = await getOrders();
    const index = orders.findIndex(o => o.id === id);
    
    if (index === -1) return false;
    
    orders[index] = {
      ...orders[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(ORDERS_FILE, JSON.stringify({ orders }, null, 2));
    return true;
  } catch (error) {
    console.error('Error updating order:', error);
    return false;
  }
}

export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
  const orders = await getOrders();
  return orders.find(o => o.stripeSessionId === sessionId) || null;
}

// Customer Management
export interface Customer {
  id: string;
  email: string;
  name: string;
  phone?: string;
  addresses: Array<{
    type: 'shipping' | 'billing';
    line1: string;
    line2?: string;
    city: string;
    state?: string;
    postal_code: string;
    country: string;
    isDefault?: boolean;
  }>;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

const CUSTOMERS_FILE = path.join(process.cwd(), 'data', 'customers.json');

export async function getCustomers(): Promise<Customer[]> {
  try {
    const data = await fs.readFile(CUSTOMERS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json.customers || [];
  } catch (error) {
    return [];
  }
}

export async function getCustomer(email: string): Promise<Customer | null> {
  const customers = await getCustomers();
  return customers.find(c => c.email === email) || null;
}

export async function createOrUpdateCustomer(customerData: Partial<Customer>): Promise<Customer> {
  const customers = await getCustomers();
  const existingIndex = customers.findIndex(c => c.email === customerData.email);
  
  if (existingIndex >= 0) {
    customers[existingIndex] = {
      ...customers[existingIndex],
      ...customerData,
      updatedAt: new Date().toISOString()
    };
    await fs.writeFile(CUSTOMERS_FILE, JSON.stringify({ customers }, null, 2));
    return customers[existingIndex];
  } else {
    const newCustomer: Customer = {
      id: `cust_${Date.now()}`,
      email: customerData.email!,
      name: customerData.name || '',
      addresses: customerData.addresses || [],
      totalOrders: 0,
      totalSpent: 0,
      ...customerData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    customers.push(newCustomer);
    await fs.writeFile(CUSTOMERS_FILE, JSON.stringify({ customers }, null, 2));
    return newCustomer;
  }
}

// Coupon Management
export interface Coupon {
  id: string;
  code: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimumAmount?: number;
  usageLimit?: number;
  usageCount: number;
  validFrom: string;
  validUntil?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

const COUPONS_FILE = path.join(process.cwd(), 'data', 'coupons.json');

export async function getCoupons(): Promise<Coupon[]> {
  try {
    const data = await fs.readFile(COUPONS_FILE, 'utf-8');
    const json = JSON.parse(data);
    return json.coupons || [];
  } catch (error) {
    return [];
  }
}

export async function getCoupon(code: string): Promise<Coupon | null> {
  const coupons = await getCoupons();
  return coupons.find(c => c.code === code && c.active) || null;
}

export async function validateCoupon(code: string, orderAmount: number): Promise<{ valid: boolean; discount: number; message?: string }> {
  const coupon = await getCoupon(code);
  
  if (!coupon) {
    return { valid: false, discount: 0, message: 'クーポンコードが無効です' };
  }
  
  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validUntil = coupon.validUntil ? new Date(coupon.validUntil) : null;
  
  if (now < validFrom) {
    return { valid: false, discount: 0, message: 'このクーポンはまだ使用できません' };
  }
  
  if (validUntil && now > validUntil) {
    return { valid: false, discount: 0, message: 'このクーポンは有効期限が切れています' };
  }
  
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'このクーポンは使用上限に達しています' };
  }
  
  if (coupon.minimumAmount && orderAmount < coupon.minimumAmount) {
    return { valid: false, discount: 0, message: `このクーポンは${coupon.minimumAmount}円以上の注文で使用できます` };
  }
  
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = Math.floor(orderAmount * (coupon.value / 100));
  } else {
    discount = Math.min(coupon.value, orderAmount);
  }
  
  return { valid: true, discount };
}

export async function useCoupon(code: string): Promise<boolean> {
  const coupons = await getCoupons();
  const index = coupons.findIndex(c => c.code === code);
  
  if (index === -1) return false;
  
  coupons[index].usageCount += 1;
  coupons[index].updatedAt = new Date().toISOString();
  
  await fs.writeFile(COUPONS_FILE, JSON.stringify({ coupons }, null, 2));
  return true;
}