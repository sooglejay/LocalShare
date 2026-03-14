'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Send,
  Copy,
  Check,
  RefreshCw,
  Trash2,
  Users,
  Clock,
  Monitor,
  ChevronDown,
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  device: string;
  deviceId: string;
  timestamp: number;
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputContent, setInputContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const [deviceId] = useState(() =>
    Math.random().toString(36).slice(2, 6).toUpperCase()
  );
  const [deviceName] = useState(() => `设备-${deviceId}`);
  const [onlineDevices, setOnlineDevices] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageIdRef = useRef<string>('');

  // 获取消息列表
  const fetchMessages = useCallback(async () => {
    try {
      const url = lastMessageIdRef.current
        ? `/api/messages?after=${lastMessageIdRef.current}`
        : '/api/messages';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success && data.data.messages.length > 0) {
        setMessages((prev) => {
          const newMessages = [...prev, ...data.data.messages];
          // 去重
          const uniqueMessages = Array.from(
            new Map(newMessages.map((m) => [m.id, m])).values()
          );
          return uniqueMessages;
        });
        // 更新最后一条消息ID
        const lastMessage = data.data.messages[data.data.messages.length - 1];
        lastMessageIdRef.current = lastMessage.id;
      }
    } catch (error) {
      console.error('获取消息失败:', error);
    }
  }, []);

  // 发送消息
  const sendMessage = async () => {
    if (!inputContent.trim() || isLoading) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: inputContent.trim(),
          device: deviceName,
          deviceId: deviceId,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setInputContent('');
        // 立即获取新消息
        fetchMessages();
      }
    } catch (error) {
      console.error('发送消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 复制消息内容
  const copyMessage = async (id: string, content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 清空消息
  const clearMessages = async () => {
    if (!confirm('确定要清空所有消息吗？')) return;
    try {
      await fetch('/api/messages', { method: 'DELETE' });
      setMessages([]);
      lastMessageIdRef.current = '';
    } catch (error) {
      console.error('清空消息失败:', error);
    }
  };

  // 滚动到底部
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 自动同步
  useEffect(() => {
    if (!autoSync) return;
    fetchMessages();
    const interval = setInterval(fetchMessages, 1000);
    return () => clearInterval(interval);
  }, [autoSync, fetchMessages]);

  // 新消息时滚动到底部
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // 更新在线设备
  useEffect(() => {
    const devices = new Set<string>();
    const now = Date.now();
    messages.forEach((m) => {
      if (now - m.timestamp < 5 * 60 * 1000) {
        // 5分钟内活跃
        devices.add(m.device);
      }
    });
    setOnlineDevices(devices);
  }, [messages]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 格式化日期
  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    const today = new Date();
    if (date.toDateString() === today.toDateString()) {
      return '今天';
    }
    return date.toLocaleDateString('zh-CN', {
      month: 'long',
      day: 'numeric',
    });
  };

  // 按日期分组消息
  const groupedMessages = messages.reduce<{ date: string; messages: Message[] }[]>(
    (groups, message) => {
      const date = formatDate(message.timestamp);
      const lastGroup = groups[groups.length - 1];
      if (lastGroup && lastGroup.date === date) {
        lastGroup.messages.push(message);
      } else {
        groups.push({ date, messages: [message] });
      }
      return groups;
    },
    []
  );

  return (
    <div className="flex flex-col h-screen bg-slate-50 dark:bg-slate-950">
      {/* 头部 */}
      <header className="flex-shrink-0 border-b bg-white dark:bg-slate-900 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-semibold">LocalShare 群聊</h1>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                {onlineDevices.size + 1} 台设备在线
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Badge variant="secondary">{deviceName}</Badge>
            </div>
            <Switch checked={autoSync} onCheckedChange={setAutoSync} />
          </div>
        </div>
      </header>

      {/* 消息列表 */}
      <main className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-3xl mx-auto space-y-4">
          {groupedMessages.map((group) => (
            <div key={group.date}>
              {/* 日期分隔 */}
              <div className="flex items-center justify-center my-4">
                <div className="px-3 py-1 rounded-full bg-slate-200 dark:bg-slate-800 text-xs text-muted-foreground">
                  {group.date}
                </div>
              </div>

              {/* 消息 */}
              {group.messages.map((message) => {
                const isMe = message.deviceId === deviceId;
                return (
                  <div
                    key={message.id}
                    className={`flex gap-3 mb-4 ${isMe ? 'flex-row-reverse' : ''}`}
                  >
                    {/* 头像 */}
                    <div
                      className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                        isMe
                          ? 'bg-gradient-to-br from-blue-500 to-blue-600'
                          : 'bg-gradient-to-br from-gray-500 to-gray-600'
                      }`}
                    >
                      {message.device.slice(-2).toUpperCase()}
                    </div>

                    {/* 消息内容 */}
                    <div className={`max-w-[70%] ${isMe ? 'text-right' : ''}`}>
                      <div
                        className={`flex items-center gap-2 mb-1 ${isMe ? 'flex-row-reverse' : ''}`}
                      >
                        <span className="text-xs text-muted-foreground">
                          {message.device}
                        </span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(message.timestamp)}
                        </span>
                      </div>
                      <Card
                        className={`p-3 relative group hover:shadow-md transition-shadow ${
                          isMe
                            ? 'bg-blue-500 text-white border-blue-500'
                            : 'bg-white dark:bg-slate-900'
                        }`}
                      >
                        <pre className="whitespace-pre-wrap text-sm font-mono break-all pr-6">
                          {message.content}
                        </pre>
                        {/* 复制按钮 */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            copyMessage(message.id, message.content);
                          }}
                          className={`absolute bottom-1 right-1 p-1.5 rounded-md opacity-0 group-hover:opacity-100 transition-all ${
                            copiedId === message.id
                              ? 'bg-green-500/20'
                              : isMe
                              ? 'bg-white/20 hover:bg-white/30'
                              : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title="复制"
                        >
                          {copiedId === message.id ? (
                            <Check className={`w-3.5 h-3.5 ${isMe ? 'text-white' : 'text-green-500'}`} />
                          ) : (
                            <Copy className={`w-3.5 h-3.5 ${isMe ? 'text-white/80' : 'text-muted-foreground'}`} />
                          )}
                        </button>
                      </Card>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}

          {messages.length === 0 && (
            <div className="text-center text-muted-foreground py-20">
              <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800 mx-auto mb-4 flex items-center justify-center">
                <Monitor className="w-8 h-8" />
              </div>
              <p>暂无消息</p>
              <p className="text-sm mt-1">发送内容开始分享</p>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* 输入区域 */}
      <footer className="flex-shrink-0 border-t bg-white dark:bg-slate-900 px-4 py-3">
        <div className="max-w-3xl mx-auto">
          <div className="flex gap-2">
            <Textarea
              ref={textareaRef}
              value={inputContent}
              onChange={(e) => setInputContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="输入内容，按 Enter 发送..."
              className="min-h-[44px] max-h-32 resize-none"
              rows={1}
            />
            <div className="flex flex-col gap-2">
              <Button
                onClick={sendMessage}
                disabled={isLoading || !inputContent.trim()}
                className="h-[44px] px-6"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => {
                  try {
                    const text = await navigator.clipboard.readText();
                    setInputContent(text);
                  } catch (error) {
                    console.error('粘贴失败:', error);
                  }
                }}
                className="h-7 px-2"
              >
                <Copy className="w-3 h-3 mr-1" />
                粘贴
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={scrollToBottom}
                className="h-7 px-2"
              >
                <ChevronDown className="w-3 h-3 mr-1" />
                滚动到底部
              </Button>
            </div>
            <div className="flex items-center gap-2">
              {messages.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearMessages}
                  className="h-7 px-2 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-3 h-3 mr-1" />
                  清空
                </Button>
              )}
              <span>{inputContent.length} 字符</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
