import { CreatePostForm } from '@/components/form/post/create-post-form';
import { BaseLayout } from '@/components/layout/base-layout';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageTitle } from '@/lib/utils';
import { Head } from '@inertiajs/react';
import { ReactNode } from 'react';

export default function CreatePost() {
  return (
    <>
      <Head>
        <title>{pageTitle('Create Post')}</title>
      </Head>
      <div className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>
              <h1 className="font-bold">Create New Post</h1>
            </CardTitle>
            <CardDescription>Write and publish your content. You can save as draft or schedule for later</CardDescription>
          </CardHeader>
        </Card>
        <CreatePostForm />
      </div>
    </>
  );
}

CreatePost.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
