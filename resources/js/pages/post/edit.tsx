import { PostForm } from '@/components/form/post/post-form';
import { BaseLayout } from '@/components/layout/base-layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pageTitle } from '@/lib/utils';
import post from '@/routes/post';
import { PostsTable } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';
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
          <CardContent>
            <Button asChild className="gap-1.5" variant="outline">
              <Link href={post.all()}>
                <ArrowRight />
                Back to All Post
              </Link>
            </Button>
          </CardContent>
        </Card>
        <div className="mx-auto max-w-360">
          <PostForm {...props} />
        </div>
      </div>
    </>
  );
}

EditPost.layout = (page: ReactNode) => <BaseLayout>{page}</BaseLayout>;
