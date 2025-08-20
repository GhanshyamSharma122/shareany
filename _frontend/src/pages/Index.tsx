import { useState } from "react";
import { Upload, Share2, Clock, FileText, Image, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { UploadZone } from "@/components/UploadZone";
import { ShareCard } from "@/components/ShareCard";
import { RetrieveSection } from "@/components/RetrieveSection";

const Index = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [text, setText] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [shareData, setShareData] = useState<{ keyword: string; createdAt: string } | null>(null);

  const handleUpload = async () => {
    if (!text && files.length === 0) {
      toast.error("Please add some text or files to share");
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      
      // Add text to form data
      if (text) {
        formData.append('text', text);
      }
      
      // Add files to form data
      files.forEach((file) => {
        formData.append('files', file);
      });

  // Make sure this URL matches your backend server (default: http://localhost:8000/)
  // If you change the frontend dev port, update backend CORS accordingly
  const response = await fetch(' https://shareany.onrender.com', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (response.ok && result.status === 200) {
        setShareData({
          keyword: result.createdStore.keyword,
          createdAt: result.createdStore.createdAt
        });
        toast.success("Files uploaded successfully!");
      } else {
        throw new Error(result.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error("Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setText("");
    setShareData(null);
  };

  if (shareData) {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto animate-fade-in">
          <ShareCard 
            keyword={shareData.keyword}
            onReset={resetForm}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="w-full max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-primary bg-clip-text text-transparent">
            ShareAny
          </h1>
          <p className="text-xl text-muted-foreground mb-2">
            Share files and text temporarily
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>Files expire after 24 hours</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Upload Section */}
          <div className="space-y-6 animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card className="p-6 gradient-card border-primary/20 shadow-card">
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <Upload className="w-6 h-6 text-primary" />
                Upload & Share
              </h2>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Message (Optional)
                  </label>
                  <Textarea
                    placeholder="Add a message or text content..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="min-h-[100px] bg-background/50 border-primary/20"
                  />
                </div>

                <UploadZone files={files} onFilesChange={setFiles} />

                <Button 
                  onClick={handleUpload}
                  disabled={isUploading}
                  className="w-full gradient-primary text-white hover:opacity-90 transition-smooth shadow-elegant"
                  size="lg"
                >
                  {isUploading ? "Uploading..." : "Create Share Link"}
                  <Share2 className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Card>
          </div>

          {/* Retrieve Section */}
          <div className="animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <RetrieveSection />
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid md:grid-cols-3 gap-6 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <Card className="p-6 text-center gradient-card border-primary/20 shadow-card transition-smooth hover:shadow-glow">
            <Clock className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">24 Hour Expiry</h3>
            <p className="text-sm text-muted-foreground">
              Files automatically delete after 24 hours for your privacy
            </p>
          </Card>
          
          <Card className="p-6 text-center gradient-card border-primary/20 shadow-card transition-smooth hover:shadow-glow">
            <FileText className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Text & Files</h3>
            <p className="text-sm text-muted-foreground">
              Share both text messages and files up to 3 files per share
            </p>
          </Card>
          
          <Card className="p-6 text-center gradient-card border-primary/20 shadow-card transition-smooth hover:shadow-glow">
            <Share2 className="w-8 h-8 text-primary mx-auto mb-3" />
            <h3 className="font-semibold mb-2">Easy Sharing</h3>
            <p className="text-sm text-muted-foreground">
              Get a simple keyword to share your files with anyone
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
