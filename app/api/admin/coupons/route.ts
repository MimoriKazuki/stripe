import { NextRequest, NextResponse } from 'next/server';
import { getCoupons, validateCoupon } from '@/lib/db';
import fs from 'fs/promises';
import path from 'path';

const COUPONS_FILE = path.join(process.cwd(), 'data', 'coupons.json');

export async function GET(req: NextRequest) {
  try {
    const coupons = await getCoupons();
    
    // アクティブなクーポンと期限切れクーポンを分ける
    const now = new Date();
    const activeCoupons = coupons.filter(c => {
      const validUntil = c.validUntil ? new Date(c.validUntil) : null;
      return c.active && (!validUntil || validUntil > now);
    });
    
    const expiredCoupons = coupons.filter(c => {
      const validUntil = c.validUntil ? new Date(c.validUntil) : null;
      return !c.active || (validUntil && validUntil <= now);
    });
    
    return NextResponse.json({
      active: activeCoupons,
      expired: expiredCoupons,
      total: coupons.length
    });
  } catch (error) {
    console.error('Error fetching coupons:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const couponData = await req.json();
    const coupons = await getCoupons();
    
    // 重複チェック
    if (coupons.find(c => c.code === couponData.code)) {
      return NextResponse.json({ error: 'Coupon code already exists' }, { status: 400 });
    }
    
    const newCoupon = {
      id: `coupon_${Date.now()}`,
      ...couponData,
      usageCount: 0,
      active: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    coupons.push(newCoupon);
    await fs.writeFile(COUPONS_FILE, JSON.stringify({ coupons }, null, 2));
    
    return NextResponse.json(newCoupon);
  } catch (error) {
    console.error('Error creating coupon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { id, ...updates } = await req.json();
    const coupons = await getCoupons();
    const index = coupons.findIndex(c => c.id === id);
    
    if (index === -1) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }
    
    coupons[index] = {
      ...coupons[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    await fs.writeFile(COUPONS_FILE, JSON.stringify({ coupons }, null, 2));
    
    return NextResponse.json(coupons[index]);
  } catch (error) {
    console.error('Error updating coupon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Coupon ID required' }, { status: 400 });
    }
    
    const coupons = await getCoupons();
    const filteredCoupons = coupons.filter(c => c.id !== id);
    
    if (filteredCoupons.length === coupons.length) {
      return NextResponse.json({ error: 'Coupon not found' }, { status: 404 });
    }
    
    await fs.writeFile(COUPONS_FILE, JSON.stringify({ coupons: filteredCoupons }, null, 2));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting coupon:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}