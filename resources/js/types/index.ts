export type UsersTable = {
  id: string;
  name: string;
  email: string;
  email_verified_at: string | null;
  created_at: string | null;
  updated_at: string | null;
  avatar: string | null;
  password_changed_at: string | null;
};

export type PostsTable = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  body: string | null;
  status: 'draft' | 'published' | 'scheduled';
  publish_date: string | null;
  featured_image_path: string | null;
  user_id: string;
  deleted_at: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type UserInertiaSharedProps = {
  user: { data: Pick<UsersTable, 'name' | 'email' | 'avatar'> } | null;
};

export type FlashMessageInertiaSharedProps = {
  flashMessage: { type: 'error' | 'success'; text: string } | null;
};
