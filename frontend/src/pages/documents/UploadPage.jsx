import React, { useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { uploadDocument } from '../../redux/slices/documentSlice';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, File, X, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const UploadPage = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const inputRef = useRef(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.documents);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (selectedFile) => {
    // 10MB limit
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error('File size must be less than 10MB');
      return;
    }
    setFile(selectedFile);
    if (!title) {
      // Set default title to original name without extension
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, "");
      setTitle(nameWithoutExt);
    }
  };

  const removeFile = () => {
    setFile(null);
    setTitle('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please select a file');

    const formData = new FormData();
    formData.append('file', file);
    if (title) formData.append('title', title);

    try {
      await dispatch(uploadDocument(formData)).unwrap();
      toast.success('Document uploaded successfully');
      navigate('/documents');
    } catch (error) {
      toast.error(error || 'Upload failed');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Upload Document</h1>
        <p className="text-slate-400">Upload course materials, notes, or essays for AI analysis.</p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        
        {/* Dropzone */}
        <div 
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-colors flex flex-col items-center justify-center min-h-[300px]
            ${dragActive ? 'border-primary-500 bg-primary-500/10' : 'border-slate-700 bg-surface hover:bg-slate-800/50 hover:border-slate-600'}
            ${file ? 'hidden' : 'block'}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={handleChange}
            accept=".pdf,.docx,.doc,.txt,.ppt,.pptx"
          />
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-6 text-primary-400 shadow-xl shadow-primary-500/10">
            <UploadCloud size={40} />
          </div>
          <h3 className="text-xl font-semibold mb-2">Click or drag file to this area to upload</h3>
          <p className="text-slate-400 mb-6 max-w-sm text-sm">
            Support for a single or bulk upload. Strictly prohibited from uploading company data or other banned files.
          </p>
          <div className="flex gap-2 justify-center text-xs text-slate-500 font-medium">
            <span className="px-2 py-1 bg-slate-800 rounded-md">PDF</span>
            <span className="px-2 py-1 bg-slate-800 rounded-md">DOCX</span>
            <span className="px-2 py-1 bg-slate-800 rounded-md">TXT</span>
            <span className="px-2 py-1 bg-slate-800 rounded-md">PPT</span>
          </div>
          
          <Button 
            type="button" 
            variant="ghost" 
            className="mt-6 border border-slate-600"
            onClick={() => inputRef.current?.click()}
          >
            Select File
          </Button>
        </div>

        {/* Selected File Preview */}
        {file && (
          <div className="glass-panel p-6">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-primary-500/20 text-primary-400 rounded-xl">
                <File size={32} />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-white truncate">{file.name}</h4>
                <p className="text-sm text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button 
                type="button"
                onClick={removeFile}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <Input 
              label="Document Title" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              placeholder="Give your document a descriptive name"
              required
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-4 mt-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/documents')}>
            Cancel
          </Button>
          <Button type="submit" disabled={!file || loading}>
            {loading ? 'Uploading...' : 'Upload Document'}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default UploadPage;
