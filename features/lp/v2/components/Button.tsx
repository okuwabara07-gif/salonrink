import React from 'react';

type Variant = 'primary' | 'ghost' | 'line';
type Size = 'sm' | 'lg';
type As = 'button' | 'a';

interface BaseButtonProps {
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

interface ButtonElementProps extends BaseButtonProps {
  as?: 'button';
  type?: 'button' | 'submit' | 'reset';
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

interface AnchorElementProps extends BaseButtonProps {
  as: 'a';
  href: string;
  target?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

type ButtonProps = ButtonElementProps | AnchorElementProps;

const variantMap: Record<Variant, string> = {
  primary: 'bg-[var(--c-accent)] text-[var(--c-on-accent)] hover:bg-[var(--c-accent-2)]',
  ghost: 'bg-transparent border border-[var(--c-border)] text-[var(--c-fg)] hover:bg-[var(--c-bg-card)]',
  line: 'bg-[#06c755] text-white hover:bg-[#05a847]',
};

const sizeMap: Record<Size, string> = {
  sm: 'h-[42px] px-5 text-[14px]',
  lg: 'h-[52px] px-7 text-[16px]',
};

export default function Button({
  variant = 'primary',
  size = 'lg',
  disabled = false,
  className = '',
  children,
  ...props
}: ButtonProps) {
  const baseClasses = `inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-150 whitespace-nowrap active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed`;
  const variantClasses = variantMap[variant];
  const sizeClasses = sizeMap[size];
  const combinedClasses = `${baseClasses} ${variantClasses} ${sizeClasses} ${className}`;

  if ('as' in props && props.as === 'a') {
    const { href, target, rel, onClick } = props as AnchorElementProps;
    return (
      <a
        href={href}
        target={target}
        rel={rel}
        onClick={onClick}
        className={combinedClasses}
      >
        {children}
      </a>
    );
  }

  const { type = 'button', onClick } = props as ButtonElementProps;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={combinedClasses}
    >
      {children}
    </button>
  );
}
