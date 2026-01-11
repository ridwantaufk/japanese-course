import Link from "next/link";
import { query } from "@/lib/db";
import LevelSelector from "@/components/learning/LevelSelector";
import { MessageCircle, Clock, BarChart } from "lucide-react";
import { formatTitle } from "@/lib/learningUtils";

async function getConversations() {
  try {
    const res = await query("SELECT * FROM conversations ORDER BY id DESC");
    return res.rows;
  } catch (e) {
    return [];
  }
}

export default async function ConversationsPage() {
  const conversations = await getConversations();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-black text-slate-900 dark:text-white">
          Conversations
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Practice real-life dialogues.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {conversations.map((conv) => (
          <Link
            key={conv.id}
            href={`/learning/conversations/${conv.id}`}
            className="group relative overflow-hidden rounded-3xl bg-white p-6 shadow-md transition-all hover:-translate-y-1 hover:shadow-xl dark:bg-[#0f172a] dark:shadow-none dark:ring-1 dark:ring-white/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <MessageCircle size={80} />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300`}
              >
                {conv.jlpt_level || "N/A"}
              </span>
              {conv.topic && (
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {conv.topic}
                </span>
              )}
            </div>

            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2 line-clamp-2">
              {formatTitle(conv.title_id || conv.title_en || "Untitled")}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mb-6">
              {conv.description_id || "No description available."}
            </p>

            <div className="flex items-center gap-4 text-xs font-medium text-slate-400 border-t border-slate-100 pt-4 dark:border-white/5">
              {conv.duration_seconds && (
                <span className="flex items-center gap-1">
                  <Clock size={14} /> {Math.floor(conv.duration_seconds / 60)}{" "}
                  min
                </span>
              )}
              <span className="flex items-center gap-1">
                <BarChart size={14} /> {conv.difficulty_score || 1}/5
              </span>
            </div>
          </Link>
        ))}
      </div>

      {conversations.length === 0 && (
        <div className="text-center py-20 text-slate-400">
          No conversations found.
        </div>
      )}
    </div>
  );
}
