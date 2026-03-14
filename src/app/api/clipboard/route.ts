import { NextRequest, NextResponse } from 'next/server';

// 内存存储（重启后清空，适合临时剪贴板）
let clipboardStore: {
  content: string;
  updatedAt: number;
  device: string;
} = {
  content: '',
  updatedAt: 0,
  device: '',
};

// GET: 获取剪贴板内容
export async function GET() {
  return NextResponse.json({
    success: true,
    data: clipboardStore,
  });
}

// POST: 更新剪贴板内容
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, device } = body;

    if (typeof content !== 'string') {
      return NextResponse.json(
        { success: false, error: '内容必须是文本' },
        { status: 400 }
      );
    }

    // 限制内容大小（最大1MB）
    if (content.length > 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: '内容超过限制（最大1MB）' },
        { status: 400 }
      );
    }

    clipboardStore = {
      content,
      updatedAt: Date.now(),
      device: device || 'unknown',
    };

    return NextResponse.json({
      success: true,
      data: clipboardStore,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '请求解析失败' },
      { status: 400 }
    );
  }
}
