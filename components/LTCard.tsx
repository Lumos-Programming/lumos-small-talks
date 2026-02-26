import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Card, CardContent, CardHeader, CardTitle, Avatar, Badge, Button } from './ui'
import { Talk } from '@/lib/firebase'
import { format } from 'date-fns'

interface LTCardProps {
  talk: Talk;
  onEdit?: (talk: Talk) => void;
  onDelete?: (talkId: string) => void;
  isOwner?: boolean;
}

export function LTCard({ talk, onEdit, onDelete, isOwner }: LTCardProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-start space-x-4 pb-2">
        <Avatar src={talk.presenterAvatar} alt={talk.presenterName} className="h-12 w-12" />
        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <Badge variant="outline">{talk.presenterName}</Badge>
            <span className="text-[10px] text-muted-foreground">#{talk.order}</span>
          </div>
          <CardTitle className="text-xl font-bold">{talk.title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {talk.description}
          </ReactMarkdown>
        </div>
      </CardContent>
      {(isOwner && (onEdit || onDelete)) && (
        <div className="p-4 pt-0 flex justify-end space-x-2">
          <Button variant="outline" size="sm" onClick={() => onEdit?.(talk)}>編集</Button>
          <Button variant="destructive" size="sm" onClick={() => onDelete?.(talk.id)}>削除</Button>
        </div>
      )}
      <div className="px-6 pb-4 text-[10px] text-muted-foreground text-right">
        登録: {format(talk.createdAt.toDate(), 'yyyy-MM-dd HH:mm')}
      </div>
    </Card>
  )
}
