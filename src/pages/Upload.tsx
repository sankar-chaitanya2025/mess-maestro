import { useState, useCallback } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { 
  Upload as UploadIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Download,
  File,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const Upload = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.type === 'text/csv') {
      setFile(droppedFile);
      setUploadStatus('idle');
    } else {
      toast.error('Please upload a valid CSV file');
    }
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('idle');
    }
  }, []);

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate upload progress
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // Simulate upload completion
    setTimeout(() => {
      clearInterval(interval);
      setUploadProgress(100);
      setIsUploading(false);
      setUploadStatus('success');
      toast.success('File uploaded successfully!', {
        description: `${file.name} has been processed.`,
      });
    }, 2500);
  };

  const handleClear = () => {
    setFile(null);
    setUploadStatus('idle');
    setUploadProgress(0);
  };

  const handleDownloadTemplate = () => {
    const template = 'UID,Date,Day,Time,Meal_Time,Mess_Hall_No\nUID0001,2024-01-15,Monday,08:30,Breakfast,1\nUID0002,2024-01-15,Monday,12:45,Lunch,2\nUID0003,2024-01-15,Monday,19:15,Dinner,3';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mess-data-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Layout title="Upload Data" subtitle="Import scan data from CSV files">
      <div className="mx-auto max-w-3xl">
        {/* Upload Area */}
        <div
          className={cn(
            'relative mb-6 rounded-xl border-2 border-dashed p-12 text-center transition-all duration-200 fade-in',
            isDragging 
              ? 'border-primary bg-primary/5' 
              : 'border-border hover:border-muted-foreground',
            file && 'border-solid'
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {!file ? (
            <>
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent">
                <UploadIcon className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">
                Drag & drop CSV file here
              </h3>
              <p className="mb-4 text-sm text-muted-foreground">
                or click to browse your files
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <p className="text-xs text-muted-foreground">
                Supported format: CSV (max 10MB)
              </p>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-accent">
                  <File className="h-6 w-6 text-foreground" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
                <button
                  onClick={handleClear}
                  className="ml-4 rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="h-2 overflow-hidden rounded-full bg-accent">
                    <div
                      className="h-full bg-primary transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Uploading... {uploadProgress}%
                  </p>
                </div>
              )}

              {uploadStatus === 'success' && (
                <div className="flex items-center justify-center gap-2 text-success">
                  <CheckCircle2 className="h-5 w-5" />
                  <span>Upload complete!</span>
                </div>
              )}

              {uploadStatus === 'error' && (
                <div className="flex items-center justify-center gap-2 text-destructive">
                  <AlertCircle className="h-5 w-5" />
                  <span>Upload failed. Please try again.</span>
                </div>
              )}

              {!isUploading && uploadStatus === 'idle' && (
                <Button onClick={handleUpload} className="gap-2">
                  <UploadIcon className="h-4 w-4" />
                  Upload File
                </Button>
              )}
            </div>
          )}
        </div>

        {/* CSV Format Reference */}
        <div className="rounded-xl border border-border bg-card p-6 fade-in">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">CSV Format Reference</h3>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <p className="mb-4 text-sm text-muted-foreground">
            Your CSV file should contain the following columns:
          </p>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="overflow-x-auto bg-accent/30 p-4 font-mono text-sm">
              <code className="text-foreground">
                UID,Date,Day,Time,Meal_Time,Mess_Hall_No
              </code>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            <h4 className="text-sm font-medium text-foreground">Column Descriptions:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li><span className="font-mono text-foreground">UID</span> - Student unique identifier (e.g., UID0001)</li>
              <li><span className="font-mono text-foreground">Date</span> - Date in YYYY-MM-DD format</li>
              <li><span className="font-mono text-foreground">Day</span> - Day of the week (e.g., Monday)</li>
              <li><span className="font-mono text-foreground">Time</span> - Time in HH:MM format (24-hour)</li>
              <li><span className="font-mono text-foreground">Meal_Time</span> - Breakfast, Lunch, Dinner, or Snacks</li>
              <li><span className="font-mono text-foreground">Mess_Hall_No</span> - Hall number (1, 2, or 3)</li>
            </ul>
          </div>

          <div className="mt-4 rounded-lg bg-accent/30 p-4">
            <h4 className="mb-2 text-sm font-medium text-foreground">Sample Data:</h4>
            <pre className="overflow-x-auto text-xs text-muted-foreground">
{`UID0001,2024-01-15,Monday,08:30,Breakfast,1
UID0002,2024-01-15,Monday,12:45,Lunch,2
UID0003,2024-01-15,Monday,19:15,Dinner,3
UID0004,2024-01-15,Monday,16:30,Snacks,1`}
            </pre>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Upload;
