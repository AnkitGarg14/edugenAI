import React from 'react';
import { FileText, File, FileType2, FileCode2, Presentation } from 'lucide-react';
import { Link } from 'react-router-dom';

const getFileIcon = (format) => {
  switch (format) {
    case 'pdf': return <FileType2 className="text-red-400" size={32} />;
    case 'docx': return <FileText className="text-blue-400" size={32} />;
    case 'txt': return <FileCode2 className="text-slate-400" size={32} />;
    case 'ppt':
    case 'pptx': return <Presentation className="text-orange-400" size={32} />;
    default: return <File className="text-primary-400" size={32} />;
  }
};

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const DocumentCard = ({ document }) => {
  console.log(document);
  return (
    <Link to={`/documents/${document._id}`} className="block group">
      <div className="glass-panel p-5 flex flex-col h-full hover:border-primary-500/30 hover:shadow-primary-500/10 transition-all cursor-pointer relative">
        <div className="flex justify-between items-start mb-4">
          <div className="p-3 bg-surface rounded-xl group-hover:scale-110 transition-transform">
            {getFileIcon(document.format)}
          </div>
          {/* Status Badge */}
          <div className={`text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full ${
            document.status === 'embedded' ? 'bg-green-500/20 text-green-400' :
            document.status === 'processing' ? 'bg-amber-500/20 text-amber-400' :
            'bg-slate-500/20 text-slate-400'
          }`}>
            {document.status}
          </div>
        </div>
        
       <h3
  className="mt-3 text-sm font-semibold text-slate-800 line-clamp-2 break-words min-h-[48px]"
  title={document.originalName}
>
  {document.originalName}
</h3>
        <div className="mt-auto pt-4 flex items-center justify-between text-xs text-slate-500">
          <span>{formatBytes(document.sizeInBytes)}</span>
          <span>{new Date(document.createdAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
};

export default DocumentCard;
