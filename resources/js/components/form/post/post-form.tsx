import PostController from '@/actions/App/Http/Controllers/PostController';
import { DatePickerInput } from '@/components/datepicker-input';
import { SelectInput } from '@/components/select-input';
import { SubmitBtn } from '@/components/submit-btn';
import { TextInput } from '@/components/text-input';
import { TextareaInput } from '@/components/textarea-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { cn, showServerValidationError } from '@/lib/utils';
import { EditPostProps } from '@/pages/post/edit';
import { PostsTable } from '@/types';
import { zodResolver } from '@hookform/resolvers/zod';
import { router, usePage } from '@inertiajs/react';
import axios, { isCancel } from 'axios';
import { format } from 'date-fns';
import { LoaderCircleIcon, Trash2Icon, UploadCloudIcon } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import z from 'zod';

const postStatusOptions = [
  {
    label: 'Draft',
    value: 'draft',
  },
  {
    label: 'Published',
    value: 'published',
  },
  {
    label: 'Scheduled',
    value: 'scheduled',
  },
] as const satisfies { label: string; value: string }[];

const postStatusValues = postStatusOptions.map((p) => p.value);

const postFormSchema = z
  .object({
    title: z.string().trim().min(10, 'minimum for title is 10 characters.').max(100, 'title is more than 100 characters.'),
    slug: z.string(),
    excerpt: z.string().trim().max(300, 'excerpt is more than 300 characters.'),
    body: z.string().trim().min(100, 'minimum for body is 100 characters.').max(10_000, 'body is more than 10,000 characters.'),
    status: z.literal(postStatusValues, 'valid status is required.'),
    publish_date: z
      .date()
      .optional()
      .refine((date) => {
        if (!date) return true;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return date >= today;
      }, 'publish date must be today or in the future.'),
  })
  .refine(
    (data) => {
      if (data.status === 'scheduled') {
        return data.publish_date !== undefined;
      }
      return true;
    },
    {
      message: 'publish date is required when status is scheduled.',
      path: ['publish_date'],
    },
  );

export const PostForm = ({ post: { data: post } }: EditPostProps) => {
  const form = useForm<z.infer<typeof postFormSchema>>({
    resolver: zodResolver(postFormSchema),
    defaultValues: {
      title: post.title ?? '',
      slug: post.slug ?? '',
      excerpt: post.excerpt ?? '',
      body: post.body ?? '',
      status: post.status ?? 'draft',
      publish_date: new Date(post.publish_date ?? Date.now()),
    },
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
  } = form;
  const [isPending, setIsPending] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const isFormDisabled = isSubmitting || isPending || uploadStatus === 'uploading';

  const status = watch('status');

  useEffect(() => {
    if (status !== 'scheduled') {
      form.setValue('publish_date', undefined);
    }
  }, [status, form]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        router.patch(
          PostController.update({ postId: post.id }),
          {
            ...data,
            publish_date: data.publish_date ? format(data.publish_date, 'yyyy-MM-dd') : null,
          },
          {
            onBefore() {
              setIsPending(true);
            },
            onFinish() {
              setIsPending(false);
            },
            onError(error) {
              showServerValidationError(error);
            },
          },
        );
      })}
      className="flex flex-col items-start gap-4 lg:flex-row"
    >
      <Card className="w-full flex-1">
        <CardContent>
          <FieldGroup className="gap-4">
            <TextInput control={control} name="title" label="Title" />
            <TextInput control={control} name="slug" label="Slug" inputProps={{ readOnly: true, disabled: true }} />
            <TextareaInput
              control={form.control}
              name="excerpt"
              label="Excerpt"
              textareaProps={{
                placeholder: 'Brief summary of your post...',
                className: 'min-h-24',
              }}
            />
            <TextareaInput
              control={form.control}
              name="body"
              label="Body"
              textareaProps={{
                placeholder: 'Write your post content...',
                className: 'min-h-60',
              }}
            />
            <SubmitBtn isLoading={isFormDisabled} disabled={isFormDisabled} className="hidden self-start lg:inline-flex">
              Update
            </SubmitBtn>
          </FieldGroup>
        </CardContent>
      </Card>
      <div className="w-full space-y-4 lg:w-96">
        <Card>
          <CardContent>
            <FieldGroup className="gap-4">
              <SelectInput control={control} name="status" label="Status" options={postStatusOptions} placeholder="Select status" />
              {status === 'scheduled' && (
                <DatePickerInput
                  control={control}
                  name="publish_date"
                  label="Publish Date"
                  placeholder="Select publish date"
                  disabledDates={(date) => {
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    return date < today;
                  }}
                />
              )}
              <SubmitBtn isLoading={isFormDisabled} disabled={isFormDisabled} className="self-start lg:hidden">
                Update
              </SubmitBtn>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card className="gap-0">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadFeaturedImage
              postId={post.id}
              initialFeaturedImageUrl={post.featured_image_url}
              uploadStatus={uploadStatus}
              setUploadStatus={setUploadStatus}
            />
          </CardContent>
        </Card>
      </div>
    </form>
  );
};

const featuredImageSchema = z
  .instanceof(File, { error: 'featured image must be a file.' })
  .refine((file) => file.size >= 1024, 'minimum file size is 1kb.')
  .refine((file) => file.size <= 1024 * 1024 * 5, 'maximum file size is 5mb.')
  .refine((file) => {
    return file.type.startsWith('image/') && file.type !== 'image/svg+xml' && !file.name.toLowerCase().endsWith('.svg');
  }, 'only raster images (png, jpg, jpeg, webp) are allowed. svg files are not supported.');

const UploadFeaturedImage = ({
  uploadStatus,
  setUploadStatus,
  postId,
  initialFeaturedImageUrl,
}: {
  uploadStatus: 'idle' | 'uploading' | 'completed' | 'error';
  setUploadStatus: (status: 'idle' | 'uploading' | 'completed' | 'error') => void;
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
