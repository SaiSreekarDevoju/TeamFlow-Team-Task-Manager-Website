import React, { useState } from 'react';
import { useCreateComment, useDeleteComment } from '../../hooks/useTasks';
import { useAuth } from '../../hooks/useAuth';
import Avatar from '../ui/Avatar';
import Button from '../ui/Button';
import { formatDistanceToNow } from 'date-fns';
import { Trash2 } from 'lucide-react';

const CommentSection = ({ projectId, taskId, comments, projectMembers }) => {
  const { user } = useAuth();
  const { mutate: createComment, isPending } = useCreateComment();
  const { mutate: deleteComment } = useDeleteComment();
  
  const [content, setContent] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionFilter, setMentionFilter] = useState('');

  // Simple @mention detection logic
  const handleInput = (e) => {
    const val = e.target.value;
    setContent(val);
    
    // Look for @word at the end of the input
    const match = val.match(/@([a-zA-Z0-9_.-]*)$/);
    if (match) {
      setShowMentions(true);
      setMentionFilter(match[1]);
    } else {
      setShowMentions(false);
    }
  };

  const handleSelectMention = (name) => {
    const newVal = content.replace(/@([a-zA-Z0-9_.-]*)$/, `@${name} `);
    setContent(newVal);
    setShowMentions(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (content.trim()) {
      createComment({ projectId, taskId, content }, { onSuccess: () => setContent('') });
    }
  };

  const filteredMembers = projectMembers.filter(m => 
    m.user.name.toLowerCase().includes(mentionFilter.toLowerCase()) || 
    m.user.email.toLowerCase().includes(mentionFilter.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Comment Form */}
      <div className="flex space-x-3">
        <Avatar user={user} size="md" className="mt-1" />
        <div className="flex-1 relative">
          <form onSubmit={handleSubmit}>
            <textarea
              value={content}
              onChange={handleInput}
              placeholder="Add a comment... (use @ to mention people)"
              rows={3}
              className="block w-full rounded-md border-slate-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm resize-none"
            />
            
            {showMentions && filteredMembers.length > 0 && (
              <div className="absolute z-10 w-64 bg-white shadow-lg rounded-md border border-slate-200 mt-1 max-h-48 overflow-auto">
                {filteredMembers.map(m => (
                  <div 
                    key={m.userId}
                    className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center space-x-2 text-sm"
                    onClick={() => handleSelectMention(m.user.email.split('@')[0])}
                  >
                    <Avatar user={m.user} size="sm" />
                    <span>{m.user.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-2 flex justify-end">
              <Button type="submit" size="sm" disabled={!content.trim()} isLoading={isPending}>
                Comment
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-5">
        {comments.map((comment) => (
          <div key={comment.id} className="flex space-x-3 group">
            <Avatar user={comment.author} size="md" />
            <div className="flex-1 bg-slate-50 rounded-lg px-4 py-3 border border-slate-100">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-slate-900">{comment.author.name}</span>
                  <span className="text-xs text-slate-500">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                </div>
                {(user.role === 'ADMIN' || user.id === comment.authorId) && (
                  <button 
                    onClick={() => deleteComment({ projectId, taskId, commentId: comment.id })}
                    className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div className="text-sm text-slate-700 whitespace-pre-wrap break-words">
                {/* Render mentions as blue text for demo */}
                {comment.content.split(/(@[a-zA-Z0-9_.-]+)/g).map((part, i) => 
                  part.startsWith('@') ? <span key={i} className="text-blue-600 font-medium">{part}</span> : part
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CommentSection;
