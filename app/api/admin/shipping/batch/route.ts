import { NextRequest, NextResponse } from 'next/server';
import { processShippingBatch } from '@/lib/shipping';

// バッチ処理API（自動配送ステータス更新）
export async function POST(req: NextRequest) {
  try {
    // バッチ処理を実行
    await processShippingBatch();
    
    return NextResponse.json({ 
      success: true, 
      message: '配送ステータスのバッチ更新が完了しました' 
    });
  } catch (error) {
    console.error('Error processing shipping batch:', error);
    return NextResponse.json({ 
      error: 'バッチ処理中にエラーが発生しました' 
    }, { status: 500 });
  }
}

// バッチ処理の手動実行（開発用）
export async function GET(req: NextRequest) {
  try {
    await processShippingBatch();
    
    return NextResponse.json({ 
      success: true, 
      message: '配送ステータスのバッチ更新が完了しました',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error processing shipping batch:', error);
    return NextResponse.json({ 
      error: 'バッチ処理中にエラーが発生しました' 
    }, { status: 500 });
  }
}