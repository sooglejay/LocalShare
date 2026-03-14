import { NextRequest, NextResponse } from 'next/server';

// 消息类型
interface Message {
  id: string;
  content: string;
  device: string;
  deviceId: string;
  timestamp: number;
}

// 消息存储（最多保留100条）
let messages: Message[] = [];
const MAX_MESSAGES = 100;

// 生成唯一ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

// GET: 获取消息列表
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const after = searchParams.get('after'); // 获取此ID之后的消息
  
  let filteredMessages = messages;
  if (after) {
    const afterIndex = messages.findIndex(m => m.id === after);
    if (afterIndex !== -1) {
      filteredMessages = messages.slice(afterIndex + 1);
    }
  }
  
  return NextResponse.json({
    success: true,
    data: {
      messages: filteredMessages,
      total: messages.length,
    },
  });
}

// POST: 发送新消息
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, device, deviceId } = body;

    if (typeof content !== 'string' || !content.trim()) {
      return NextResponse.json(
        { success: false, error: '内容不能为空' },
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

    // 创建新消息
    const newMessage: Message = {
      id: generateId(),
      content: content.trim(),
      device: device || '未知设备',
      deviceId: deviceId || 'unknown',
      timestamp: Date.now(),
    };

    // 添加到消息列表
    messages.push(newMessage);

    // 保持最多100条消息
    if (messages.length > MAX_MESSAGES) {
      messages = messages.slice(-MAX_MESSAGES);
    }

    return NextResponse.json({
      success: true,
      data: newMessage,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: '请求解析失败' },
      { status: 400 }
    );
  }
}

// DELETE: 清空消息
export async function DELETE() {
  messages = [];
  return NextResponse.json({
    success: true,
    message: '消息已清空',
  });
}
