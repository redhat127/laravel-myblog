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

const createPostSchema = z
  .object({
    title: z.string().trim().min(10, 'minimum for title is 10 characters.').max(100, 'title is more than 100 characters.'),
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
    featured_image: z.string(),
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

export const CreatePostForm = () => {
  const form = useForm<z.infer<typeof createPostSchema>>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      body: '',
      status: 'draft',
      featured_image: '',
    },
  });
  const {
    control,
    handleSubmit,
    formState: { isSubmitting },
    watch,
    setValue,
  } = form;
  const [isPending, setIsPending] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'completed' | 'error'>('idle');
  const isFormDisabled = isSubmitting || isPending || uploadStatus === 'uploading';

  const status = watch('status');

  const setFeaturedImage = (value: string) => {
    setValue('featured_image', value);
  };

  useEffect(() => {
    if (status !== 'scheduled') {
      form.setValue('publish_date', undefined);
    }
  }, [status, form]);

  return (
    <form
      onSubmit={handleSubmit((data) => {
        router.post(
          PostController.store(),
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
              Create
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
                Create
              </SubmitBtn>
            </FieldGroup>
          </CardContent>
        </Card>
        <Card className="gap-2">
          <CardHeader>
            <CardTitle className="text-sm font-medium">Featured Image</CardTitle>
          </CardHeader>
          <CardContent>
            <UploadFeaturedImage setFeaturedImage={setFeaturedImage} uploadStatus={uploadStatus} setUploadStatus={setUploadStatus} />
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
  setFeaturedImage,
  uploadStatus,
  setUploadStatus,
}: {
  setFeaturedImage(value: string): void;
  uploadStatus: 'idle' | 'uploading' | 'completed' | 'error';
  setUploadStatus: (status: 'idle' | 'uploading' | 'completed' | 'error') => void;
}) => {
  const csrfToken = usePage<{ csrfToken: string }>().props.csrfToken;
  const [imagePreview, setImagePreview] = useState<string>();
  const ref = useRef<HTMLInputElement>(null);

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
      abortControllerRef.current?.abort();
    };
  }, []);

  return (
    <>
      <div
        onClick={() => {
          if (uploadStatus === 'uploading') return;
          ref.current?.click();
        }}
        className={cn('group h-48 cursor-pointer overflow-hidden rounded-md transition-colors hover:border-primary', {
          'border border-dashed': !imagePreview,
          'cursor-not-allowed': uploadStatus === 'uploading',
        })}
      >
        {!imagePreview ? (
          <>
            <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-center">
              <p className="text-sm font-medium">Upload Image</p>
              <p className="text-sm text-muted-foreground group-hover:text-primary">Select an image or browse files</p>
              <UploadCloudIcon className="-order-1 transition-transform group-hover:-translate-y-1" />
            </div>
          </>
        ) : (
          <img src={imagePreview} alt="featured image preview" className="h-full w-full object-cover" />
        )}
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
      {imagePreview && uploadStatus !== 'uploading' && (
        <Button
          type={'button'}
          variant="outline"
          className="mt-3 w-full"
          onClick={() => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            setImagePreview('');
            setFeaturedImage('');
            setUploadStatus('idle');
            ref.current!.value = '';
          }}
        >
          <Trash2Icon className="dark:text-red-400" />
        </Button>
      )}
      <input
        accept="image/*"
        type="file"
        className="hidden"
        ref={ref}
        onChange={(e) => {
          abortControllerRef.current?.abort();
          if (imagePreview) {
            URL.revokeObjectURL(imagePreview);
          }
          setImagePreview(undefined);
          setFeaturedImage('');
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
                .post<{ path: string }>(PostController.uploadFeaturedImage.url(), formData, {
                  signal: controller.signal,
                  headers: {
                    'X-CSRF-TOKEN': csrfToken,
                  },
                })
                .then((res) => {
                  setFeaturedImage(res.data.path);
                  setUploadStatus('completed');
                })
                .catch((error) => {
                  if (isCancel(error)) {
                    return;
                  }
                  const message = error.response?.data?.message || 'Upload failed. try again.';
                  toast.error(message);
                  setUploadStatus('error');
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
