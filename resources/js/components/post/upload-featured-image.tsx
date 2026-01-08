import PostController from '@/actions/App/Http/Controllers/PostController';
import { cn } from '@/lib/utils';
import { PostsTable } from '@/types';
import { router, usePage } from '@inertiajs/react';
import axios, { isCancel } from 'axios';
import { LoaderCircleIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';
import z from 'zod';
import { Button } from '../ui/button';

const featuredImageSchema = z
  .instanceof(File, { error: 'featured image must be a file.' })
  .refine((file) => file.size >= 1024, 'minimum file size is 1kb.')
  .refine((file) => file.size <= 1024 * 1024 * 5, 'maximum file size is 5mb.')
  .refine((file) => {
    return file.type.startsWith('image/') && file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg');
  }, 'only raster images (png, jpg, jpeg, webp) are allowed. svg files are not supported.');

export const UploadFeaturedImage = ({
  uploadStatus,
  setUploadStatus,
  setDeletingPhoto,
  postId,
  initialFeaturedImageUrl,
}: {
  uploadStatus: 'idle' | 'uploading' | 'completed' | 'error';
  setUploadStatus: (status: 'idle' | 'uploading' | 'completed' | 'error') => void;
  setDeletingPhoto(value: boolean): void;
  postId: PostsTable['id'];
  initialFeaturedImageUrl: string | null;
}) => {
  const csrfToken = usePage<{ csrfToken: string }>().props.csrfToken;
  const [imagePreview, setImagePreview] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);
  const [featuredImageUrl, setFeaturedImageUrl] = useState(initialFeaturedImageUrl);

  useEffect(() => {
    if (uploadStatus === 'completed' || uploadStatus === 'error') {
      const timer = setTimeout(() => {
        setUploadStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [uploadStatus, setUploadStatus]);

  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => {
      // Only revoke blob URLs
      if (imagePreview && imagePreview.startsWith('blob:')) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort();
    };
  }, []);

  const handleDelete = () => {
    // Only revoke blob URLs
    if (imagePreview && imagePreview.startsWith('blob:')) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(undefined);
    setFeaturedImageUrl(null);
    setUploadStatus('idle');
    if (ref.current) {
      ref.current.value = '';
    }

    router.delete(PostController.deleteFeaturedImage({ postId }), {
      preserveScroll: true,
      onBefore() {
        setDeletingPhoto(true);
      },
      onFinish() {
        setDeletingPhoto(false);
      },
    });
  };

  return (
    <>
      <div
        onClick={() => {
          if (uploadStatus === 'uploading') return;
          ref.current?.click();
        }}
        className={cn('group h-48 cursor-pointer overflow-hidden rounded-md transition-colors hover:border-primary', {
          'border border-dashed': !imagePreview && !featuredImageUrl,
          'cursor-not-allowed': uploadStatus === 'uploading',
        })}
      >
        {!imagePreview && !featuredImageUrl && (
          <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
            <p className="text-sm font-medium">Upload Image</p>
            <p className="text-sm text-muted-foreground group-hover:text-primary">Select an image or browse files</p>
            <UploadCloudIcon className="-order-1 transition-transform group-hover:-translate-y-1" />
          </div>
        )}
        {imagePreview && <img src={imagePreview} alt="featured image preview" className="h-full w-full object-cover" />}
        {!imagePreview && featuredImageUrl && <img src={featuredImageUrl} alt={'featured image'} className="h-full w-full object-cover" />}
      </div>

      {uploadStatus !== 'idle' && (
        <div className="mt-2">
          <p
            className={cn('flex items-center gap-1 text-sm', {
              'text-sky-400': uploadStatus === 'uploading',
              'text-green-400': uploadStatus === 'completed',
              'text-red-400': uploadStatus === 'error',
            })}
          >
            {uploadStatus === 'uploading' && <LoaderCircleIcon className="size-4 animate-spin" />}
            {uploadStatus === 'completed' ? '✔ Completed' : uploadStatus === 'error' ? '❌ Error happened. try again.' : 'Uploading...'}
          </p>
        </div>
      )}

      {(imagePreview || featuredImageUrl) && uploadStatus !== 'uploading' && (
        <Button type={'button'} variant="outline" className="mt-3 w-full" onClick={handleDelete}>
          <Trash2Icon className="dark:text-red-400" />
        </Button>
      )}

      <input
        accept="image/png,image/jpeg,image/jpg,image/webp"
        type="file"
        className="hidden"
        ref={ref}
        onChange={(e) => {
          abortControllerRef.current?.abort();

          // Only revoke blob URLs
          if (imagePreview && imagePreview.startsWith('blob:')) {
            URL.revokeObjectURL(imagePreview);
          }

          setImagePreview(undefined);
          setUploadStatus('idle');

          const file = e.target.files?.[0];
          e.target.value = '';

          if (!file) {
            return;
          }

          try {
            const validation = featuredImageSchema.safeParse(file);

            if (!validation.success) {
              toast.error(z.flattenError(validation.error).formErrors[0]);
            } else {
              const url = URL.createObjectURL(validation.data);
              setImagePreview(url);

              const formData = new FormData();
              formData.append('file', validation.data);

              setUploadStatus('uploading');

              const controller = new AbortController();
              abortControllerRef.current = controller;

              axios
                .post<{ url: string }>(PostController.uploadFeaturedImage.url({ postId }), formData, {
                  signal: controller.signal,
                  headers: {
                    'X-CSRF-TOKEN': csrfToken,
                  },
                })
                .then(({ data: { url } }) => {
                  if (imagePreview?.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                  }

                  setImagePreview(undefined);
                  setFeaturedImageUrl(url);
                  setUploadStatus('completed');
                })
                .catch((error) => {
                  if (isCancel(error)) {
                    setUploadStatus('idle');
                    return;
                  }

                  toast.error('Upload failed. try again.');
                  setUploadStatus('error');

                  if (imagePreview?.startsWith('blob:')) {
                    URL.revokeObjectURL(imagePreview);
                  }

                  setImagePreview(undefined);
                });
            }
          } catch {
            setImagePreview(undefined);
            setUploadStatus('idle');
          }
        }}
      />
    </>
  );
};
