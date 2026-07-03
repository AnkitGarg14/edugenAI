import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocumentById, deleteDocument, clearCurrentDocument } from '../../redux/slices/documentSlice';
import { processDocumentTrigger } from '../../redux/slices/chatSlice';
import { ArrowLeft, Trash2, FileText, Calendar, HardDrive, Sparkles, Loader2 } from 'lucide-react';
import { useStudySession } from '../../hooks/useStudySession';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

const DocumentDetailsPage = () => {
  useStudySession('Document');
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { currentDocument: doc, loading, error } = useSelector((state) => state.documents);
  
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    dispatch(fetchDocumentById(id));
    return () => {
      dispatch(clearCurrentDocument());
    };
  }, [dispatch, id]);

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this document? This action cannot be undone.')) {
      try {
        await dispatch(deleteDocument(id)).unwrap();
        toast.success('Document deleted');
        navigate('/documents');
      } catch (err) {
        toast.error(err || 'Failed to delete');
      }
    }
  };

  const handleProcess = async () => {
    try {
      setIsProcessing(true);
      await dispatch(processDocumentTrigger(id)).unwrap();
      toast.success('Processing started. This may take a minute.');
      // Optionally poll for status here, but for now we'll just show it started.
    } catch (err) {
      toast.error(err || 'Failed to start processing');
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading && !doc) {
    return <div className="p-8 flex justify-center">Loading...</div>;
  }

  if (error || !doc) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl mb-4">Document not found</h2>
        <Button onClick={() => navigate('/documents')}>Back to Library</Button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-8">
      <Link to="/documents" className="flex items-center text-sm text-slate-400 hover:text-white mb-6 w-fit transition-colors">
        <ArrowLeft className="w-4 h-4 mr-2" /> Back to Library
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Details */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <div className="glass-panel p-8">
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-blue-500/20 text-blue-400 rounded-2xl flex items-center justify-center">
                  <FileText size={32} />
                </div>
                <div>
                  <div className="flex items-center gap-3 max-w-full overflow-hidden">
                    <h1 
                      className="text-3xl font-bold text-white truncate max-w-[300px] sm:max-w-[400px] md:max-w-[500px]" 
                      title={doc.originalName || doc.title}
                    >
                      {doc.originalName || doc.title}
                    </h1>
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-sm text-slate-400">
                    <span className="uppercase">{doc.format} File</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><HardDrive size={14} /> {formatBytes(doc.sizeInBytes)}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1"><Calendar size={14} /> {new Date(doc.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-4 border-t border-white/10 pt-6">
              <div className="flex-1 flex items-center text-slate-300 font-medium">
                {doc.originalName || 'Unknown Document'}
              </div>
              <Button variant="ghost" className="border border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 px-6" onClick={handleDelete}>
                <Trash2 size={18} />
              </Button>
            </div>
          </div>

          {/* RAG Preview / Summary Area */}
          <div className="glass-panel p-8 relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="text-accent" size={24} />
              <h2 className="text-xl font-bold">AI Summary & Knowledge Base</h2>
            </div>

            {doc.status === 'uploaded' || doc.status === 'failed' ? (
              <div className="bg-slate-800/50 rounded-xl p-6 text-center border border-slate-700/50">
                <p className="text-slate-300 mb-4">
                  {doc.status === 'failed' ? 'Previous processing failed. Try again.' : 'This document has not been processed for AI interactions yet.'}
                </p>
                <Button variant="secondary" onClick={handleProcess} disabled={isProcessing}>
                  {isProcessing ? <><Loader2 className="animate-spin inline mr-2" size={16}/> Processing...</> : 'Process Document'}
                </Button>
              </div>
            ) : (
              <div className="text-slate-300 text-sm leading-relaxed">
                <p>AI processing status: <span className={`font-semibold capitalize ${doc.status === 'embedded' ? 'text-green-400' : 'text-amber-400'}`}>{doc.status}</span></p>
                {doc.status === 'embedded' && (
                   <Link to="/chat">
                     <Button className="mt-4">Ask Questions in AI Chat</Button>
                   </Link>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Metadata / Chat */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-panel p-6">
            <h3 className="font-semibold text-lg mb-4">File Details</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Original Name</span>
                <span className="text-white font-medium truncate max-w-[150px]" title={doc.originalName}>{doc.originalName}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Status</span>
                <span className={`font-medium uppercase text-xs px-2 py-1 rounded bg-slate-800 ${doc.status === 'embedded' ? 'text-green-400' : 'text-amber-400'}`}>
                  {doc.status}
                </span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-slate-400">Added On</span>
                <span className="text-white font-medium">{new Date(doc.createdAt).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default DocumentDetailsPage;
