import { query } from '@/lib/db';
import { notFound } from 'next/navigation';
import ConversationViewer from '@/components/learning/ConversationViewer';

async function getConversation(id) {
  try {
    const convRes = await query('SELECT * FROM conversations WHERE id = $1', [id]);
    if (convRes.rows.length === 0) return null;
    
    const linesRes = await query('SELECT * FROM conversation_lines WHERE conversation_id = $1 ORDER BY line_order ASC', [id]);
    
    return { ...convRes.rows[0], lines: linesRes.rows };
  } catch (e) {
    return null;
  }
}

export default async function ConversationDetail({ params }) {
  const { id } = await params;
  const conversation = await getConversation(id);

  if (!conversation) return notFound();

  return <ConversationViewer conversation={conversation} />;
}