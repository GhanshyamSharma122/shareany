import { useState } from "react";
import { Copy, Check, RotateCcw, Share2, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface ShareCardProps {
  keyword: string;
  onReset: () => void;
}

export const ShareCard = ({ keyword, onReset }: ShareCardProps) => {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/${keyword}`;

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Failed to copy link");
    }
  };

  const copyKeyword = async () => {
    try {
      await navigator.clipboard.writeText(keyword);
      toast.success("Keyword copied!");
    } catch (error) {
      toast.error("Failed to copy keyword");
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'TempShare - Temporary File Sharing',
          text: `Access my shared files with keyword: ${keyword}`,
          url: shareUrl,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Card className="p-8 gradient-card border-primary/20 shadow-glow animate-scale-in">
      <div className="text-center mb-6">
        <div className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto mb-4 animate-pulse-glow">
          <Share2 className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold mb-2">Share Link Created!</h2>
        <p className="text-muted-foreground">
          Your files are ready to share. Link expires in 24 hours.
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">Share URL</label>
          <div className="flex gap-2">
            <Input
              value={shareUrl}
              readOnly
              className="bg-background/50 border-primary/20"
            />
            <Button
              onClick={copyToClipboard}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-500" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">Access Keyword</label>
          <div className="flex gap-2">
            <Input
              value={keyword}
              readOnly
              className="bg-background/50 border-primary/20 font-mono text-lg"
            />
            <Button
              onClick={copyKeyword}
              variant="outline"
              size="icon"
              className="shrink-0"
            >
              <Copy className="w-4 h-4" />
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Recipients can also use this keyword to access files
          </p>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={shareNative}
            className="flex-1 gradient-primary text-white hover:opacity-90 transition-smooth"
          >
            Share Link
            <ExternalLink className="w-4 h-4 ml-2" />
          </Button>
          
          <Button
            onClick={onReset}
            variant="outline"
            className="flex-1"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Share More
          </Button>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-lg bg-primary/5 border border-primary/20">
        <p className="text-sm text-center text-muted-foreground">
          💡 <strong>Tip:</strong> Bookmark this page to check file status later
        </p>
      </div>
    </Card>
  );
};