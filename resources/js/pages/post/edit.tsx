import { PostForm } from '@/components/form/post/post-form';
import { BaseLayout } from '@/components/layout/base-layout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageTitle } from '@/lib/utils';
import { PostsTable } from '@/types';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export type EditPostProps = {
  post: { data: Omit<PostsTable, 'deleted_at' | 'created_at' | 'updated_at'> & { featured_image_url: string | null } };
};

export default function EditPost(props: EditPostProps) {
  return (
    <>
      <Head>
        <title>{pageTitle('Edit Post')}</title>
      </Head>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="font-bold">Edit Post</h1>
            </CardTitle>
            <CardDescription>Write and publish your content. You can save as draft or schedule for later</CardDescription>
          </CardHeader>
        </Card>
        <PostForm {...props} />
      </div>
    </>
  );
}

EditPost.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
