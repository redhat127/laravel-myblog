import { useUser } from '@/hooks/use-user';
import { cn, getContrastColor, hashCode } from '@/lib/utils';

type UserAvatarProps = {
  size?: number;
  className?: string;
};

const getSizeStyle = (size: number) => {
  const sizeRem = `${size * 0.25}rem`;
  return { width: sizeRem, height: sizeRem, minWidth: sizeRem };
};

export const UserAvatar = ({ size = 8, className = '' }: UserAvatarProps) => {
  const user = useUser();

  if (!user) return null;

  const { name, avatar } = user;
  const style = getSizeStyle(size);

  if (avatar) {
    return (
      <div className="overflow-hidden rounded-full" style={style}>
        <img src={avatar} alt={`${name} avatar`} className="h-full w-full object-cover" />
      </div>
    );
  }

  const hue = hashCode(name) % 360;
  const bgColor = `hsl(${hue}, 70%, 50%)`;
  const textColor = getContrastColor(hue, 70, 50);
  const initial = name[0]?.toUpperCase() || '?';

  return (
    <div className="overflow-hidden rounded-full" style={style}>
      <div
        className={cn('flex h-full w-full items-center justify-center capitalize select-none', className)}
        style={{ backgroundColor: bgColor, color: textColor }}
        aria-label={`${name} avatar`}
      >
        {initial}
      </div>
    </div>
  );
};
