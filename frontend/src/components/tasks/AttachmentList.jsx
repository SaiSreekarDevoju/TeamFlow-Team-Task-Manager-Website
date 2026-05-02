import React, { useRef, useState } from 'react';
import { Paperclip, File, Download, Trash2, Image as ImageIcon } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { formatFileSize } from '../../utils/formatters';

const AttachmentList = ({ projectId, taskId, attachments, canEdit }) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setIsUploading(true);
    try {
      await api.post(`/projects/${projectId}/tasks/${taskId}/attachments`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
      toast.success('File uploaded');
    } catch (error) {
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (attachmentId) => {
    try {
      await api.delete(`/projects/${projectId}/tasks/${taskId}/attachments/${attachmentId}`);
      queryClient.invalidateQueries({ queryKey: ['task', projectId, taskId] });
      toast.success('File deleted');
    } catch (error) {
      toast.error('Failed to delete file');
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-8 h-8 text-blue-500" />;
    if (mimeType.includes('pdf')) return <File className="w-8 h-8 text-red-500" />;
    return <File className="w-8 h-8 text-slate-400" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-slate-900">Attachments</h3>
        {canEdit && (
          <div>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
              className="hidden" 
            />
            <button 
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 flex items-center bg-blue-50 px-2 py-1 rounded"
            >
              <Paperclip className="w-3.5 h-3.5 mr-1" />
              {isUploading ? 'Uploading...' : 'Add file'}
            </button>
          </div>
        )}
      </div>

      {attachments.length === 0 ? (
        <div className="border-2 border-dashed border-slate-200 rounded-md p-4 flex flex-col items-center justify-center text-slate-500">
          <Paperclip className="w-6 h-6 mb-2 text-slate-300" />
          <p className="text-sm">No attachments yet</p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {attachments.map(attachment => (
            <li key={attachment.id} className="col-span-1 flex items-center p-3 border border-slate-200 rounded-md bg-white hover:shadow-sm transition-shadow group">
              <div className="flex-shrink-0 mr-3">
                {getFileIcon(attachment.mimeType)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate" title={attachment.filename}>
                  {attachment.filename}
                </p>
                <p className="text-xs text-slate-500">
                  {formatFileSize(attachment.fileSize)} • {attachment.uploader?.name}
                </p>
              </div>
              <div className="flex-shrink-0 ml-2 flex items-center space-x-2">
                <a 
                  href={import.meta.env.VITE_API_URL.replace('/api/v1', '') + attachment.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </a>
                {canEdit && (
                  <button 
                    onClick={() => handleDelete(attachment.id)}
                    className="text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AttachmentList;
