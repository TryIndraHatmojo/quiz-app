import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Upload, X, File as FileIcon, FileVideo, FileImage } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { useDropzone, FileRejection, DropzoneOptions } from 'react-dropzone';

interface FileUploaderProps {
    onFileSelect: (file: File | null) => void;
    accept?: DropzoneOptions['accept'];
    currentFile?: string | null;
    previewUrl?: string | null;
    maxSize?: number; // in bytes
    label?: string;
    description?: string;
    className?: string;
    fileType?: 'image' | 'video' | 'any';
}

export function FileUploader({
    onFileSelect,
    accept,
    currentFile,
    previewUrl,
    maxSize = 10 * 1024 * 1024, // 10MB default
    label = 'Unggah File',
    description = 'Seret dan lepas file di sini, atau klik untuk memilih',
    className,
    fileType = 'any',
}: FileUploaderProps) {
    const [preview, setPreview] = useState<string | null>(previewUrl || null);
    const [file, setFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (previewUrl) {
            setPreview(previewUrl);
        } else {
            setPreview(null);
        }
    }, [previewUrl]);

    const onDrop = useCallback(
        (acceptedFiles: File[], fileRejections: FileRejection[]) => {
            if (fileRejections.length > 0) {
                const rejection = fileRejections[0];
                if (rejection.errors[0].code === 'file-too-large') {
                    setError(`File terlalu besar. Maksimal ${maxSize / 1024 / 1024}MB.`);
                } else {
                    setError(rejection.errors[0].message);
                }
                return;
            }

            if (acceptedFiles.length > 0) {
                const selectedFile = acceptedFiles[0];
                setFile(selectedFile);
                setError(null);
                onFileSelect(selectedFile);

                // Create preview
                if (selectedFile.type.startsWith('image/') || selectedFile.type.startsWith('video/')) {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        setPreview(reader.result as string);
                    };
                    reader.readAsDataURL(selectedFile);
                } else {
                    setPreview(null);
                }
            }
        },
        [maxSize, onFileSelect]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        maxSize,
        multiple: false,
    });

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFile(null);
        setPreview(null);
        onFileSelect(null);
        setError(null);
    };

    const isVideo = (url: string | null, type: string | null) => {
        if (type === 'video') return true;
        if (url && (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg'))) return true;
        return false;
    };

    const renderPreview = () => {
        if (!preview && !currentFile) return null;

        const src = preview || currentFile;
        const isVid = isVideo(src, fileType === 'video' ? 'video' : file?.type.startsWith('video/') ? 'video' : null);

        if (isVid) {
            return (
                <video
                    src={src!}
                    controls
                    className="h-full w-full object-contain rounded-lg bg-black"
                />
            );
        }

        return (
            <img
                src={src!}
                alt="Preview"
                className="h-full w-full object-contain rounded-lg"
            />
        );
    };

    return (
        <div className={cn('space-y-2', className)}>
            <div
                {...getRootProps()}
                className={cn(
                    'relative flex min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 px-6 py-10 text-center transition-colors hover:bg-gray-100',
                    isDragActive && 'border-primary bg-primary/5',
                    error && 'border-destructive/50 bg-destructive/5'
                )}
            >
                <input {...getInputProps()} />
                
                {(preview || currentFile) ? (
                    <div className="relative h-full w-full max-h-[300px]">
                        {renderPreview()}
                        <div className="absolute -right-2 -top-2">
                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="h-6 w-6 rounded-full"
                                onClick={removeFile}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        {file && (
                            <div className="absolute bottom-2 left-2 right-2 rounded-md bg-black/50 p-2 text-xs text-white truncate">
                                {file.name}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <div className="rounded-full bg-white p-4 shadow-sm">
                            <Upload className="h-8 w-8 text-gray-400" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-medium text-gray-700">
                                {isDragActive ? 'Lepaskan file di sini' : label}
                            </p>
                            <p className="text-xs text-gray-500">{description}</p>
                        </div>
                    </div>
                )}
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
        </div>
    );
}
