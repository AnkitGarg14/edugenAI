import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDocuments } from '../../redux/slices/documentSlice';
import { Link } from 'react-router-dom';
import { Search, Plus, UploadCloud } from 'lucide-react';
import DocumentCard from '../../components/documents/DocumentCard';
import Button from '../../components/ui/Button';

const DocumentLibraryPage = () => {
  const dispatch = useDispatch();
  const { documents, loading } = useSelector((state) => state.documents);
  const [search, setSearch] = useState('');

  useEffect(() => {
    // Debounce search in a real app, just triggering directly for now
    const timer = setTimeout(() => {
      dispatch(fetchDocuments(search));
    }, 300);
    return () => clearTimeout(timer);
  }, [dispatch, search]);

  return (
    <div className="flex flex-col gap-6 w-full max-w-[1600px] mx-auto pb-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-bold">Document Library</h1>
          <p className="text-slate-400">Manage and analyze your learning materials.</p>
        </div>
        
        <Link to="/documents/upload">
          <Button className="flex items-center gap-2">
            <Plus size={18} /> Upload Document
          </Button>
        </Link>
      </div>

      {/* Toolbar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search documents by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
        </div>
      </div>

      {/* Grid */}
      {loading && documents.length === 0 ? (
        <div className="flex justify-center py-20">
          <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : documents.length === 0 ? (
        <div className="glass-panel py-20 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-slate-400">
            <UploadCloud size={40} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No documents found</h3>
          <p className="text-slate-400 mb-6 max-w-md">
            {search ? 'We couldn\'t find anything matching your search.' : 'You haven\'t uploaded any documents yet. Upload a PDF, DOCX, or TXT file to get started.'}
          </p>
          {!search && (
            <Link to="/documents/upload">
              <Button>Upload First Document</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {documents.map((doc) => (
            <DocumentCard key={doc._id} document={doc} />
          ))}
        </div>
      )}

    </div>
  );
};

export default DocumentLibraryPage;
