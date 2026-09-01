import { useState } from 'react';
import { X, Loader2, Send } from 'lucide-react';
import { supabase, CATEGORIES, type Category, type PostSection } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

interface SubmitPostModalProps {
  onClose: () => void;
  onSubmitted: () => void;
}

const ANIME_IMAGES = [
  'https://images.pexels.com/photos/3022717/pexels-photo-3022717.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/5426418/pexels-photo-5426418.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/4024211/pexels-photo-4024211.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/22866319/pexels-photo-22866319.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/38454106/pexels-photo-38454106.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  'https://images.pexels.com/photos/5493069/pexels-photo-5493069.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
];

export function SubmitPostModal({ onClose, onSubmitted }: SubmitPostModalProps) {
  const { user, profile } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('Human Behavior & Psychology');
  const [excerpt, setExcerpt] = useState('');
  const [body, setBody] = useState('');
  const [sourceTitle, setSourceTitle] = useState('');
  const [sourceAuthor, setSourceAuthor] = useState('');
  const [selectedImage, setSelectedImage] = useState(ANIME_IMAGES[0]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!title.trim() || !excerpt.trim() || !body.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!user) {
      setError('You must be signed in to post.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const sections: PostSection[] = body
      .split('\n\n')
      .filter((s) => s.trim())
      .map((s) => {
        if (s.startsWith('# ')) {
          return { type: 'heading', content: s.slice(2).trim() };
        }
        if (s.startsWith('> ')) {
          return { type: 'takeaway', content: s.slice(2).trim() };
        }
        return { type: 'paragraph', content: s.trim() };
      });

    const { error: insertError } = await supabase.from('posts').insert({
      title: title.trim(),
      category,
      excerpt: excerpt.trim(),
      body: sections,
      source_title: sourceTitle.trim() || null,
      source_author: sourceAuthor.trim() || null,
      image_url: selectedImage,
      author_name: profile?.username ?? 'Anonymous',
      author_id: user.id,
      is_curated: false,
    });

    setSubmitting(false);

    if (insertError) {
      setError(insertError.message || 'Failed to submit. Please try again.');
      return;
    }

    onSubmitted();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink-950/85 backdrop-blur-md animate-fade-in">
      <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="mb-6 flex justify-end">
            <button
              onClick={onClose}
              className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 px-4 py-2 text-sm font-medium text-ink-200 transition-colors hover:border-ink-600 hover:text-ink-100"
            >
              <X className="h-4 w-4" />
              Close
            </button>
          </div>

          <div className="animate-fade-in-up rounded-3xl border border-ink-800 bg-ink-900/80 p-6 shadow-2xl shadow-black/50 sm:p-8 md:p-10">
            <h2 className="mb-2 font-serif text-2xl font-semibold text-ink-100">
              Share Your Perspective
            </h2>
            <p className="mb-6 text-sm text-ink-400">
              Posting as <span className="font-medium text-gold-400">{profile?.username ?? 'Anonymous'}</span>
            </p>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
                  Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. The Power of Negative Visualization"
                  className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                />
              </div>

              {/* Category */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
                  Category *
                </label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.filter((c) => c !== 'All').map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-all ${
                        category === cat
                          ? 'border-gold-500 bg-gold-500/15 text-gold-400'
                          : 'border-ink-700 bg-ink-850 text-ink-300 hover:border-ink-600'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Excerpt */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
                  Short Summary *
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="One-sentence hook for the feed card..."
                  className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                />
              </div>

              {/* Body */}
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
                  Your Insight *
                </label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={
                    'Write your breakdown here. Use blank lines to separate paragraphs. Start a line with # for a heading, or > for a key takeaway.'
                  }
                  rows={6}
                  className="w-full resize-y rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-3 text-sm leading-relaxed text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                />
              </div>

              {/* Source (optional) */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
                    Source Book (optional)
                  </label>
                  <input
                    type="text"
                    value={sourceTitle}
                    onChange={(e) => setSourceTitle(e.target.value)}
                    placeholder="e.g. Meditations"
                    className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-ink-400">
                    Source Author (optional)
                  </label>
                  <input
                    type="text"
                    value={sourceAuthor}
                    onChange={(e) => setSourceAuthor(e.target.value)}
                    placeholder="e.g. Marcus Aurelius"
                    className="w-full rounded-xl border border-ink-700 bg-ink-900/60 px-4 py-2.5 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-500/50 focus:outline-none focus:ring-1 focus:ring-gold-500/30"
                  />
                </div>
              </div>

              {/* Image picker */}
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-ink-400">
                  Choose an Anime Visual
                </label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  {ANIME_IMAGES.map((img) => (
                    <button
                      key={img}
                      onClick={() => setSelectedImage(img)}
                      className={`relative h-16 overflow-hidden rounded-lg border-2 transition-all ${
                        selectedImage === img
                          ? 'border-gold-500 ring-2 ring-gold-500/30'
                          : 'border-ink-700 hover:border-ink-600'
                      }`}
                    >
                      <img src={img} alt="" className="h-full w-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm text-red-400">
                  {error}
                </p>
              )}

              {/* Submit */}
              <div className="flex justify-end pt-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="flex items-center gap-2 rounded-full bg-gradient-to-r from-gold-400 to-gold-600 px-6 py-3 text-sm font-semibold text-ink-950 shadow-lg shadow-gold-600/20 transition-all hover:shadow-gold-500/30 disabled:opacity-50"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Publish to Feed
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
