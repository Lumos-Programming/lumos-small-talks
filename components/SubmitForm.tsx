'use client'

import { useState, useEffect } from 'react'
import { Button, Input, Textarea, Card, CardHeader, CardTitle, CardContent } from './ui'
import { Talk } from '@/lib/firebase'

interface SubmitFormProps {
  weekId: string;
  onSubmit: (data: { title: string; description: string; id?: string }) => Promise<void>;
  editingTalk?: Talk | null;
  onCancelEdit?: () => void;
}

export function SubmitForm({ weekId, onSubmit, editingTalk, onCancelEdit }: SubmitFormProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (editingTalk) {
      setTitle(editingTalk.title)
      setDescription(editingTalk.description)
    } else {
      setTitle('')
      setDescription('')
    }
    setError(null)
  }, [editingTalk])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      await onSubmit({ title, description, id: editingTalk?.id })
      if (!editingTalk) {
        setTitle('')
        setDescription('')
      }
    } catch (err: any) {
      setError(err.message || '登録に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-2 border-purple-100 shadow-xl">
      <CardHeader className="bg-gradient-card border-b py-4">
        <CardTitle className="flex items-center gap-2 text-xl">
          {editingTalk ? (
            <>
              <span className="text-2xl">✏️</span>
              <span>発表を編集</span>
            </>
          ) : (
            <>
              <span className="text-2xl">📝</span>
              <span>新しく発表を登録</span>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-purple-600">📌</span>
              タイトル
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="例: Reactの最新機能について"
              required
              className="border-2 focus:border-purple-300"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold flex items-center gap-2">
              <span className="text-purple-600">📄</span>
              概要（Markdown対応）
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="発表の内容を詳しく記載してください&#10;&#10;例:&#10;- React 19の新機能を紹介&#10;- Server Componentsの使い方&#10;- デモを交えて解説"
              rows={6}
              required
              className="border-2 focus:border-purple-300"
            />
            <p className="text-xs text-muted-foreground">
              💡 Markdownで箇条書きや見出しが使えます
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-gradient-primary hover:shadow-lg transition-all py-5 font-semibold"
            >
              {loading ? '保存中...' : editingTalk ? '✅ 更新する' : '🚀 登録する'}
            </Button>
            {editingTalk && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancelEdit}
                className="px-6 hover:bg-gray-100"
              >
                キャンセル
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
