import { useState } from "react";
import { Search, Download, FileText, Image, File, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface FileData {
  text?: string;
  files: string[];
  keyword: string;
  createdAt: string;
}

export const RetrieveSection = () => {
  const [keyword, setKeyword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<FileData | null>(null);

  const handleRetrieve = async () => {
    if (!keyword.trim()) {
      toast.error("Please enter a keyword");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`https://shareany.onrender.com/${keyword.trim()}`);
      const result = await response.json();

      if (response.ok && result.status === 200) {
        setData({
          text: result.data.text || "",
          files: result.data.files || [],
          keyword: result.data.keyword,
          createdAt: result.data.createdAt
        });
        toast.success("Files retrieved successfully!");
      } else {
        throw new Error(result.message || 'Files not found');
      }
    } catch (error) {
      console.error('Retrieve error:', error);
      toast.error("Files not found or expired");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (url: string, filename: string) => {
    try {
      toast.info(`Starting download of ${filename}...`);
      
      // Try multiple download strategies for better compatibility
      
      // Strategy 1: Force download using fetch and blob (works for most cases)
      try {
        const response = await fetch(url, {
          mode: 'cors',
          headers: {
            'Accept': '*/*',
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const blob = await response.blob();
        
        // Create blob URL and download
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = filename;
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        setTimeout(() => window.URL.revokeObjectURL(blobUrl), 100);
        
        toast.success(`${filename} downloaded successfully!`);
        return;
        
      } catch (fetchError) {
        console.warn('Fetch download failed, trying alternative method:', fetchError);
        
        // Strategy 2: Use Cloudinary's built-in download parameter
        let downloadUrl = url;
        if (url.includes('cloudinary.com')) {
          // Add Cloudinary download parameter
          const separator = url.includes('?') ? '&' : '?';
          downloadUrl = `${url}${separator}fl_attachment:${encodeURIComponent(filename)}`;
        }
        
        // Strategy 3: Create direct download link
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = filename;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.style.display = 'none';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        toast.success(`${filename} download started!`);
      }
      
    } catch (error) {
      console.error('Download error:', error);
      
      // Fallback: Open in new tab with download hint
      try {
        let fallbackUrl = url;
        if (url.includes('cloudinary.com')) {
          const separator = url.includes('?') ? '&' : '?';
          fallbackUrl = `${url}${separator}fl_attachment:${encodeURIComponent(filename)}`;
        }
        
        window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
        toast.info(`Opening ${filename} in new tab. Right-click and "Save as" if download doesn't start automatically.`);
      } catch (fallbackError) {
        toast.error(`Failed to download ${filename}. Please try again or contact support.`);
      }
    }
  };

  const getFileIcon = (url: string) => {
    const filename = url.toLowerCase();
    
    // Image files
    if (filename.includes('.jpg') || filename.includes('.jpeg') || 
        filename.includes('.png') || filename.includes('.gif') || 
        filename.includes('.bmp') || filename.includes('.webp') || 
        filename.includes('.svg')) {
      return <Image className="w-4 h-4" />;
    }
    
    // Document files
    if (filename.includes('.pdf') || filename.includes('.doc') || 
        filename.includes('.docx') || filename.includes('.txt') || 
        filename.includes('.rtf') || filename.includes('.odt')) {
      return <FileText className="w-4 h-4" />;
    }
    
    // Spreadsheet files
    if (filename.includes('.xlsx') || filename.includes('.xls') || 
        filename.includes('.csv') || filename.includes('.ods')) {
      return <FileText className="w-4 h-4" />;
    }
    
    // Presentation files
    if (filename.includes('.pptx') || filename.includes('.ppt') || 
        filename.includes('.odp')) {
      return <FileText className="w-4 h-4" />;
    }
    
    // Archive files
    if (filename.includes('.zip') || filename.includes('.rar') || 
        filename.includes('.7z') || filename.includes('.tar') || 
        filename.includes('.gz')) {
      return <File className="w-4 h-4" />;
    }
    
    // Default file icon
    return <File className="w-4 h-4" />;
  };

  const getFileName = (url: string) => {
    try {
      // For Cloudinary URLs, extract the original filename
      if (url.includes('cloudinary.com')) {
        // Cloudinary URLs have format: .../{public_id}.{extension}
        const parts = url.split('/');
        const lastPart = parts[parts.length - 1];
        
        // Remove version and other Cloudinary parameters
        const filename = lastPart.split('?')[0];
        
        // Decode URI component in case of encoded characters
        return decodeURIComponent(filename);
      }
      
      // For other URLs, extract filename from the path
      const parts = url.split('/');
      const filename = parts[parts.length - 1];
      
      // Remove query parameters
      const cleanFilename = filename.split('?')[0];
      
      return decodeURIComponent(cleanFilename) || 'Unknown file';
    } catch (error) {
      console.error('Error extracting filename:', error);
      return 'Unknown file';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const reset = () => {
    setKeyword("");
    setData(null);
  };

  return (
    <Card className="p-6 gradient-card border-primary/20 shadow-card">
      <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
        <Search className="w-6 h-6 text-primary" />
        Retrieve Files
      </h2>

      {!data ? (
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">
              Enter Keyword
            </label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter your keyword..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleRetrieve()}
                className="bg-background/50 border-primary/20 font-mono"
              />
              <Button
                onClick={handleRetrieve}
                disabled={isLoading}
                className="gradient-primary text-white hover:opacity-90 transition-smooth"
              >
                {isLoading ? "Searching..." : "Retrieve"}
                <Search className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Enter a keyword to retrieve shared files</p>
          </div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Shared on {formatDate(data.createdAt)}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={reset}>
              Search Again
            </Button>
          </div>

          {data.text && (
            <div className="p-4 rounded-lg bg-background/50 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Message</span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{data.text}</p>
            </div>
          )}

          {data.files.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Download className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Files ({data.files.length})</span>
              </div>
              <div className="space-y-2">
                {data.files.map((fileUrl, index) => {
                  const filename = getFileName(fileUrl);
                  return (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-lg bg-background/50 border border-primary/20 transition-smooth hover:border-primary/40"
                    >
                      {getFileIcon(fileUrl)}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{filename}</p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleDownload(fileUrl, filename)}
                        className="gradient-primary text-white hover:opacity-90 transition-smooth"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="p-4 rounded-lg bg-orange-500/5 border border-orange-500/20">
            <p className="text-sm text-center text-orange-300">
              ⏰ Files will be automatically deleted in 24 hours
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};
