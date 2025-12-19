import { Upload, X } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "@/components/ui/file-upload";

export function ImageUpload({ value, onValueChange, maxFiles = 10, maxSize = 10 * 1024 * 1024 }) {
  const [files, setFiles] = React.useState([]);

  React.useEffect(() => {
    if (value) {
      setFiles(value);
    }
  }, [value]);

  const handleFilesChange = React.useCallback((newFiles) => {
    setFiles(newFiles);
    if (onValueChange) {
      onValueChange(newFiles);
    }
  }, [onValueChange]);

  return (
    <FileUpload
      maxFiles={maxFiles}
      maxSize={maxSize}
      className="w-full"
      value={files}
      onValueChange={handleFilesChange}
      accept="image/*"
      multiple
    >
      <FileUploadDropzone className="rounded-full border-border/50 border-dashed hover:bg-accent/30 transition-colors">
        <div className="flex flex-col items-center gap-1 text-center py-2">
          <div className="flex items-center justify-center rounded-full border p-2.5">
            <Upload className="size-6 text-muted-foreground" />
          </div>
          <p className="font-medium text-sm">Drag & drop images here</p>
          <p className="text-muted-foreground text-xs">
            Or click to browse (max {maxFiles} files, up to {Math.round(maxSize / 1024 / 1024)}MB each)
          </p>
        </div>
        <FileUploadTrigger asChild>
          <Button variant="outline" size="sm" className="mt-2 rounded-full h-9 px-4 cursor-pointer">
            Browse images
          </Button>
        </FileUploadTrigger>
      </FileUploadDropzone>
      <FileUploadList className="mt-3">
        {files.map((file, index) => (
          <FileUploadItem key={index} value={file} className="rounded-xl border-border/30">
            <FileUploadItemPreview className="rounded-lg" />
            <FileUploadItemMetadata />
            <FileUploadItemDelete asChild>
              <Button variant="ghost" size="icon" className="size-7 rounded-full cursor-pointer">
                <X className="h-4 w-4" />
              </Button>
            </FileUploadItemDelete>
          </FileUploadItem>
        ))}
      </FileUploadList>
    </FileUpload>
  );
}

