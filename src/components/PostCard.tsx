import { ArrowUp, MessageCircle, BookOpen, Lock } from 'lucide-react';
import type { Post } from '@/lib/supabase';

interface PostCardProps {
  post: Post;
  voteCount: number;
  hasVoted: boolean;
  commentCount: number;
  onVote: () => void;
  onClick: () => void;
  index: number;
  locked?: boolean;
}

export function PostCard({
  post,
  voteCount,
  hasVoted,
  commentCount,
  onVote,
  onClick,
  index,
  locked = false,
}: PostCardProps) {
  return (
    <article
      onClick={onClick}
      className="group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl border border-ink-800 bg-ink-900/60 transition-all duration-300 hover:border-ink-700 hover:shadow-2xl hover:shadow-black/40"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      {/* Image */}
      {post.image_url && (
        <div className="relative h-44 overflow-hidden sm:h-52">
          <img
            src={post.image_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink-900 via-ink-900/30 to-transparent" />
          {locked && (
            <div className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full border border-gold-500/40 bg-ink-950/80 backdrop-blur-sm">
              <Lock className="h-4 w-4 text-gold-400" strokeWidth={2.5} />
            </div>
          )}
          <div className="absolute bottom-3 left-4 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-ink-950/70 px-3 py-1 text-xs font-medium tracking-wide text-gold-400 backdrop-blur-sm">
              {post.category}
            </span>
            {!post.is_curated && (
              <span className="inline-flex items-center rounded-full border border-sage-600/30 bg-ink-950/70 px-3 py-1 text-xs font-medium tracking-wide text-sage-400 backdrop-blur-sm">
                Community
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        {!post.image_url && (
          <div className="mb-3 flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs font-medium tracking-wide text-gold-400">
              {post.category}
            </span>
            {!post.is_curated && (
              <span className="inline-flex items-center rounded-full border border-sage-600/30 bg-sage-600/10 px-3 py-1 text-xs font-medium tracking-wide text-sage-400">
                Community
              </span>
            )}
            {locked && (
              <span className="ml-auto flex items-center gap-1 text-xs text-gold-400/70">
                <Lock className="h-3 w-3" strokeWidth={2.5} />
              </span>
            )}
          </div>
        )}

        <h2 className="mb-2 font-serif text-lg font-semibold leading-tight text-ink-100 transition-colors group-hover:text-gold-400 sm:text-xl">
          {post.title}
        </h2>

        <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-ink-300">
          {post.excerpt}
        </p>

        {/* Source */}
        {post.source_title && (
          <div className="mb-4 flex items-center gap-1.5">
            <BookOpen className="h-3.5 w-3.5 text-ink-500" />
            <span className="text-xs text-ink-400">
              {post.source_author} · <span className="italic">{post.source_title}</span>
            </span>
          </div>
        )}

        {/* Footer: votes + comments */}
        <div className="mt-auto flex items-center gap-4 border-t border-ink-800 pt-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onVote();
            }}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all ${
              hasVoted
                ? 'border-gold-500/50 bg-gold-500/15 text-gold-400'
                : 'border-ink-700 bg-ink-850 text-ink-300 hover:border-gold-500/40 hover:text-gold-400'
            }`}
          >
            <ArrowUp className={`h-3.5 w-3.5 ${hasVoted ? 'scale-110' : ''}`} strokeWidth={2.5} />
            {voteCount}
          </button>
          <span className="flex items-center gap-1.5 text-xs text-ink-400">
            <MessageCircle className="h-3.5 w-3.5" />
            {commentCount}
          </span>
          <span className="ml-auto text-xs text-ink-500">{post.author_name}</span>
        </div>
      </div>
    </article>
  );
}
