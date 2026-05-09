'use client';

type Props = {
  id: string;
  placeholder: string;
  src?: string;
  alt?: string;
};

export default function ImageSlot({ id, placeholder, src, alt }: Props) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt || placeholder}
        loading="lazy"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          borderRadius: 'inherit',
          display: 'block',
        }}
      />
    );
  }
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'var(--is-bg, var(--c-bg-2))',
        color: 'var(--is-fg, var(--c-fg-4))',
        border: '1px dashed var(--is-border, var(--c-border))',
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
