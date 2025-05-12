import React, { useState, useRef } from 'react';
import { Upload, File, X } from 'lucide-react';

const FileAnalyzer: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
  };

  const handleAnalyze = async () => {
    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!selectedFile) return;

    setAnalyzing(true);

    try {
      const cloudinaryFormData = new FormData();
      cloudinaryFormData.append('file', selectedFile);
      cloudinaryFormData.append('upload_preset', uploadPreset);

      const cloudinaryRes = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          body: cloudinaryFormData,
        }
      );

      if (!cloudinaryRes.ok) {
        throw new Error('Failed to upload file to Cloudinary');
      }

      const cloudinaryData = await cloudinaryRes.json();
      const uploadedUrl = cloudinaryData.secure_url;

      const backendRes = await fetch('https://student-assistant-nine.vercel.app/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: uploadedUrl }),
      });

      if (!backendRes.ok) {
        throw new Error('Backend analysis failed');
      }
      const analysis = await backendRes.json();
      console.log('Analysis result:', analysis);

      // Update local analysisResults state
      setAnalysisResults((prev) => [
        ...prev,
        {
          id: Date.now(),
          fileName: selectedFile.name,
          fileType: analysis.fileType || selectedFile.type,
          fileSize: formatFileSize(selectedFile.size),
          analysisData: analysis.analysis1.join(', '),
          timestamp: new Date(),
        },
      ]);
      removeFile();
    } catch (err) {
      console.error('Upload or analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <h2 className="text-2xl font-bold text-white mb-6">File Analyzer</h2>

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center mb-6 transition-colors duration-200 ${
          dragActive
            ? 'border-indigo-500 bg-indigo-500/10'
            : 'border-gray-600 hover:border-gray-500'
        }`}
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileChange}
        />

        <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
        <p className="text-gray-300 mb-2">Drag and drop your file here, or</p>
        <button
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200"
          onClick={() => fileInputRef.current?.click()}
        >
          Browse Files
        </button>
      </div>

      {selectedFile && (
        <div className="bg-gray-800 rounded-lg p-4 mb-6 animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <File className="text-indigo-400" />
              <div>
                <p className="text-white font-medium">{selectedFile.name}</p>
                <p className="text-gray-400 text-sm">
                  {formatFileSize(selectedFile.size)}
                </p>
              </div>
            </div>
            <button
              className="text-gray-400 hover:text-gray-200"
              onClick={removeFile}
            >
              <X size={20} />
            </button>
          </div>

          <div className="mt-4">
            <button
              className="w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors duration-200 flex items-center justify-center gap-2"
              onClick={handleAnalyze}
              disabled={analyzing}
            >
              {analyzing ? (
                <>
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Analyzing...
                </>
              ) : (
                'Analyze File'
              )}
            </button>
          </div>
        </div>
      )}

      {analysisResults.length > 0 && (
        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xl font-semibold text-white mb-4">Analysis Results</h3>

          <div className="space-y-4">
            {analysisResults.map((result) => (
              <div key={result.id} className="bg-gray-800 rounded-lg p-4 animate-fadeIn">
                <div className="flex items-center gap-3 mb-3">
                  <File className="text-indigo-400" />
                  <div>
                    <p className="text-white font-medium">{result.fileName}</p>
                    <p className="text-gray-400 text-sm">
                      {result.fileType} • {result.fileSize}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-900 rounded p-3 whitespace-pre-wrap text-gray-300">
                  Weak Topics: {result.analysisData}
                </div>

                <p className="text-gray-500 text-sm mt-2">
                  Analyzed on {result.timestamp.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileAnalyzer;
