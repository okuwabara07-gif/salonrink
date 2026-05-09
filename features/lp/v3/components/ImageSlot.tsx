'use client';

type Props = {
  id: string;
  placeholder: string;
};

export default function ImageSlot({ id, placeholder }: Props) {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--is-bg, var(--c-bg-2))',
        color: 'var(--is-fg, var(--c-fg-4))',
        border: '1px solid var(--is-border, var(--c-border))',
        borderRadius: 'inherit',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
        fontSize: 13,
        lineHeight: 1.6,
        textAlign: 'center',
      }}
      data-id={id}
      data-placeholder={placeholder}
    >
      {placeholder}
    </div>
  );
}
