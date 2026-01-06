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

export type UserInertiaSharedProps = {
  user: { data: Pick<UsersTable, 'id' | 'name' | 'email' | 'email_verified_at' | 'created_at' | 'updated_at' | 'avatar'> } | null;
};

export type FlashMessageInertiaSharedProps = {
  flashMessage: { type: 'error' | 'success'; text: string } | null;
};
