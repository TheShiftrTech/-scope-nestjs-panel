import { cn } from '@/lib/utils';
import { resolveIcon } from '@/lib/icons';
import { useBranding } from '@/lib/branding';

interface BrandMarkProps {
  className?: string;
  /** Larger mark for login page */
  size?: 'sm' | 'lg';
}

export function BrandMark({ className, size = 'sm' }: BrandMarkProps) {
  const { theme } = useBranding();
  const { logoUrl, logoIcon } = theme;
  const dim = size === 'lg' ? 'h-12 w-12' : 'h-8 w-8';
  const iconDim = size === 'lg' ? 'h-7 w-7' : 'h-5 w-5';

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt=""
        className={cn(dim, 'shrink-0 object-contain', className)}
      />
    );
  }

  const Icon = resolveIcon(logoIcon);
  return (
    <div
      className={cn(
        dim,
        'flex shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground',
        className,
      )}
    >
      <Icon className={iconDim} />
    </div>
  );
}
