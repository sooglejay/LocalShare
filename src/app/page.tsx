'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Copy, Send, RefreshCw, Check, Wifi, Clock, Monitor } from 'lucide-react';

interface ClipboardData {
  content: string;
  updatedAt: number;
  device: string;
}

export default function Home() {
  const [content, setContent] = useState('');
  const [remoteData, setRemoteData] = useState<ClipboardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [deviceId] = useState(() => `设备-${Math.random().toString(36).slice(2, 6).toUpperCase()}`);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 获取远程剪贴板
  const fetchClipboard = useCallback(async () => {
    try {
      const res = await fetch('/api/clipboard');
      const data = await res.json();
      if (data.success) {
        setRemoteData(data.data);
        if (data.data.content && data.data.device !== deviceId) {
          setContent(data.data.content);
        }
      }
    } catch (error) {
      console.error('获取剪贴板失败:', error);
    }
  }, [deviceId]);

  // 发送剪贴板内容
  const sendClipboard = async () => {
    if (!content.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/clipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, device: deviceId }),
      });
      const data = await res.json();
      if (data.success) {
        setRemoteData(data.data);
        setLastSyncTime(new Date());
      }
    } catch (error) {
      console.error('发送剪贴板失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 复制到本地剪贴板
  const copyToClipboard = async () => {
    if (!content) return;
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
    }
  };

  // 从本地剪贴板粘贴
  const pasteFromClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      setContent(text);
    } catch (error) {
      console.error('粘贴失败:', error);
    }
  };

  // 自动同步
  useEffect(() => {
    if (!autoSync) return;
    fetchClipboard();
    const interval = setInterval(fetchClipboard, 1000);
    return () => clearInterval(interval);
  }, [autoSync, fetchClipboard]);

  // 格式化时间
  const formatTime = (timestamp: number) => {
    if (!timestamp) return '从未';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 p-4 sm:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* 头部 */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Wifi className="w-6 h-6 text-blue-500" />
            <h1 className="text-2xl font-bold">局域网剪贴板同步</h1>
          </div>
          <p className="text-muted-foreground">电脑A浏览器访问此页面即可同步</p>
        </div>

        {/* 状态卡片 */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <CardTitle className="text-base">同步状态</CardTitle>
                <CardDescription>
                  当前设备: <Badge variant="secondary">{deviceId}</Badge>
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="auto-sync"
                  checked={autoSync}
                  onCheckedChange={setAutoSync}
                />
                <Label htmlFor="auto-sync" className="text-sm">自动同步</Label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Monitor className="w-4 h-4" />
                <span>最后来源: {remoteData?.device || '无'}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>更新时间: {formatTime(remoteData?.updatedAt || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 剪贴板区域 */}
        <Card>
          <CardHeader>
            <CardTitle>剪贴板内容</CardTitle>
            <CardDescription>输入内容后点击发送，或自动接收其他设备的内容</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="在这里输入或粘贴内容..."
              className="min-h-[200px] font-mono text-sm"
            />

            {/* 操作按钮 */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={sendClipboard} disabled={isLoading || !content.trim()}>
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                发送到服务器
              </Button>

              <Button variant="outline" onClick={copyToClipboard} disabled={!content}>
                {copied ? (
                  <Check className="w-4 h-4 mr-2 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4 mr-2" />
                )}
                {copied ? '已复制' : '复制内容'}
              </Button>

              <Button variant="outline" onClick={pasteFromClipboard}>
                从剪贴板粘贴
              </Button>

              <Button variant="ghost" onClick={fetchClipboard}>
                <RefreshCw className="w-4 h-4 mr-2" />
                刷新
              </Button>
            </div>

            {/* 字数统计 */}
            {content && (
              <div className="text-xs text-muted-foreground text-right">
                {content.length} 字符
              </div>
            )}
          </CardContent>
        </Card>

        {/* 使用说明 */}
        <Card className="bg-slate-50 dark:bg-slate-900 border-0">
          <CardContent className="pt-6">
            <div className="text-sm text-muted-foreground space-y-2">
              <p className="font-medium text-foreground">使用方法：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>电脑B运行此Web服务（默认端口5000）</li>
                <li>电脑A浏览器访问 <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded">http://电脑B的IP:5000</code></li>
                <li>任一设备输入内容并点击"发送到服务器"</li>
                <li>其他设备开启"自动同步"后会自动接收</li>
              </ol>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
