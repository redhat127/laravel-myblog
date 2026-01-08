import PostController from '@/actions/App/Http/Controllers/PostController';
import { DatePickerInput } from '@/components/datepicker-input';
import { UploadFeaturedImage } from '@/components/post/upload-featured-image';
import { SelectInput } from '@/components/select-input';
import { SubmitBtn } from '@/components/submit-btn';
import { TextInput } from '@/components/text-input';
import { TextareaInput } from '@/components/textarea-input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FieldGroup } from '@/components/ui/field';
import { showServerValidationError } from '@/lib/utils';
import { EditPostProps } from '@/pages/post/edit';
import postRoute from '@/routes/post';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from '@inertiajs/react';
import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
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
    body: z.string().trim().max(10_000, 'body is more than 10,000 characters.'),
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
  const [isDeleingPhoto, setIsDeletingPhoto] = useState(false);
  const isFormDisabled = isSubmitting || isPending || uploadStatus === 'uploading' || isDeleingPhoto;

  const status = watch('status');

  useEffect(() => {
    if (status !== 'scheduled') {
      form.setValue('publish_date', undefined);
    }
  }, [status, form]);

  return (
    <>
      <form
        onSubmit={handleSubmit((data) => {
          router.patch(
            PostController.update({ postId: post.id }),
            {
              ...data,
              publish_date: data.publish_date ? format(data.publish_date, 'yyyy-MM-dd') : null,
            },
            {
              preserveScroll: true,
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
                setDeletingPhoto={(value: boolean) => setIsDeletingPhoto(value)}
              />
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <div className="space-y-2">
                <SubmitBtn isLoading={isFormDisabled} disabled={isFormDisabled} className="w-full">
                  Update
                </SubmitBtn>
                <Button
                  disabled={isFormDisabled}
                  className="w-full"
                  type="button"
                  variant={'outline'}
                  onClick={() => {
                    router.get(postRoute.all());
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </>
  );
};
