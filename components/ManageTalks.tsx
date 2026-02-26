'use client'

import { useState } from 'react'
import { Talk } from '@/lib/firebase'
import { LTCard } from '@/components/LTCard'
import { SubmitForm } from '@/components/SubmitForm'

interface ManageTalksProps {
  weekId: string;
  myTalks: Talk[];
  onAction: (data: any) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export function ManageTalks({ weekId, myTalks, onAction, onDelete }: ManageTalksProps) {
  const [editingTalk, setEditingTalk] = useState<Talk | null>(null)

  return (
    <div className="space-y-12">
      <div>
        <h2 className="text-xl font-semibold mb-4">あなたの発表 ({weekId})</h2>
        {myTalks.length === 0 ? (
          <p className="text-muted-foreground italic">この週の登録はまだありません。</p>
        ) : (
          <div className="space-y-4">
            {myTalks.map(talk => (
              <LTCard 
                key={talk.id} 
                talk={talk} 
                isOwner={true} 
                onEdit={(t) => {
                  setEditingTalk(t)
                  window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
                }}
                onDelete={onDelete}
              />
            ))}
          </div>
        )}
      </div>

      <SubmitForm 
        weekId={weekId} 
        onSubmit={async (data) => {
          await onAction(data)
          setEditingTalk(null)
        }} 
        editingTalk={editingTalk}
        onCancelEdit={() => setEditingTalk(null)}
      />
    </div>
  )
}
