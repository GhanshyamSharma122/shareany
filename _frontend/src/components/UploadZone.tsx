import { useCallback, useState } from "react";
import { Upload, X, FileText, Image, File } from "lucide-react";
import { toast } from "sonner";

interface UploadZoneProps {
  files: File[];
  onFilesChange: (files: File[]) => void;
}

export const UploadZone = ({ files, onFilesChange }: UploadZoneProps) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    
    if (droppedFiles.length === 0) return;
    
    const remainingSlots = 3 - files.length;
    
    if (remainingSlots <= 0) {
      toast.error("Maximum 3 files allowed. Please remove some files first.");
      return;
    }
    
    const filesToAdd = droppedFiles.slice(0, remainingSlots);
    
    if (droppedFiles.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} file(s) can be added. Some files were skipped.`);
    }
    
    onFilesChange([...files, ...filesToAdd]);
  }, [files, onFilesChange]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length === 0) return;
    
    const remainingSlots = 3 - files.length;
    
    if (remainingSlots <= 0) {
      toast.error("Maximum 3 files allowed. Please remove some files first.");
      return;
    }
    
    const filesToAdd = selectedFiles.slice(0, remainingSlots);
    
    if (selectedFiles.length > remainingSlots) {
      toast.warning(`Only ${remainingSlots} file(s) can be added. Some files were skipped.`);
    }
    
    onFilesChange([...files, ...filesToAdd]);
    
    // Reset the input value to allow selecting the same files again
    e.target.value = '';
  }, [files, onFilesChange]);

  const removeFile = (index: number) => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  const getFileIcon = (file: File) => {
    const fileType = file.type.toLowerCase();
    const fileName = file.name.toLowerCase();
    
    // Image files
    if (fileType.startsWith('image/') || 
        fileName.endsWith('.jpg') || fileName.endsWith('.jpeg') || 
        fileName.endsWith('.png') || fileName.endsWith('.gif') || 
        fileName.endsWith('.bmp') || fileName.endsWith('.webp') || 
        fileName.endsWith('.svg')) {
      return <Image className="w-4 h-4" />;
    }
    
    // Document files
    if (fileType.includes('text') || fileType.includes('document') || 
        fileType.includes('pdf') || fileType.includes('msword') || 
        fileType.includes('wordprocessingml') || 
        fileName.endsWith('.pdf') || fileName.endsWith('.doc') || 
        fileName.endsWith('.docx') || fileName.endsWith('.txt') || 
        fileName.endsWith('.rtf') || fileName.endsWith('.odt')) {
      return <FileText className="w-4 h-4" />;
    }
    
    // Spreadsheet files
    if (fileType.includes('spreadsheet') || fileType.includes('excel') || 
        fileName.endsWith('.xlsx') || fileName.endsWith('.xls') || 
        fileName.endsWith('.csv') || fileName.endsWith('.ods')) {
      return <FileText className="w-4 h-4" />;
    }
    
    // Presentation files
    if (fileType.includes('presentation') || fileType.includes('powerpoint') || 
        fileName.endsWith('.pptx') || fileName.endsWith('.ppt') || 
        fileName.endsWith('.odp')) {
      return <FileText className="w-4 h-4" />;
    }
    
    // Default file icon for all other types
    return <File className="w-4 h-4" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      <div
        className={`upload-zone ${isDragOver ? 'drag-over' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload"
          accept="*/*"
        />
        
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 rounded-full bg-primary/10">
            <Upload className="w-8 h-8 text-primary" />
          </div>
          
          <div className="text-center">
            <p className="text-lg font-medium mb-1">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Maximum 3 files • All file types supported
            </p>
          </div>
          
          <label htmlFor="file-upload">
            <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2 cursor-pointer">
              Choose Files
            </button>
          </label>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <p className="text-sm font-medium">
            Selected Files ({files.length}/3)
          </p>
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20"
            >
              {getFileIcon(file)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 px-3 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};