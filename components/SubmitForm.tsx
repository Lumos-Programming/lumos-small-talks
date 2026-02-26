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

  useEffect(() => {
    if (editingTalk) {
      setTitle(editingTalk.title)
      setDescription(editingTalk.description)
    } else {
      setTitle('')
      setDescription('')
    }
  }, [editingTalk])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await onSubmit({ title, description, id: editingTalk?.id })
      if (!editingTalk) {
        setTitle('')
        setDescription('')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>{editingTalk ? '発表を編集' : '新しく発表を登録'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">タイトル</label>
            <Input 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="発表のタイトルを入力" 
              required 
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">概要 (Markdown対応)</label>
            <Textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)} 
              placeholder="発表の内容を詳しく記載してください" 
              rows={5}
              required 
            />
          </div>
          <div className="flex space-x-2">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? '保存中...' : (editingTalk ? '更新する' : '登録する')}
            </Button>
            {editingTalk && (
              <Button type="button" variant="outline" onClick={onCancelEdit}>キャンセル</Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
