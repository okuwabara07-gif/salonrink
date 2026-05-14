'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Icon } from './Icon';

/* ─── Global Photo Store (localStorage-backed, SSR-safe) ─────────────── */

type StoreListener = () => void;
interface PhotoStore {
  get: (id: string) => string | undefined;
  set: (id: string, dataUrl: string) => void;
  remove: (id: string) => void;
  subscribe: (fn: StoreListener) => () => void;
  all: () => Record<string, string>;
}

declare global {
  interface Window {
    __srkPhotoStore?: PhotoStore;
  }
}

function getStore(): PhotoStore | null {
  if (typeof window === 'undefined') return null;
  if (window.__srkPhotoStore) return window.__srkPhotoStore;

  let cache: Record<string, string> = {};
  try {
    cache = JSON.parse(localStorage.getItem('srk-customer-photos') || '{}');
  } catch {
    cache = {};
  }
  const listeners = new Set<StoreListener>();

  const store: PhotoStore = {
    get: (id) => cache[id],
    set: (id, dataUrl) => {
      cache[id] = dataUrl;
      try {
        localStorage.setItem('srk-customer-photos', JSON.stringify(cache));
      } catch {}
      listeners.forEach((fn) => fn());
    },
    remove: (id) => {
      delete cache[id];
      try {
        localStorage.setItem('srk-customer-photos', JSON.stringify(cache));
      } catch {}
      listeners.forEach((fn) => fn());
    },
    subscribe: (fn) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
    all: () => ({ ...cache }),
  };

  window.__srkPhotoStore = store;
  return store;
}

/* ─── Hook ──────────────────────────────────────────────────────────── */

export function useCustomerPhoto(id?: string) {
  const [, force] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const store = getStore();
    if (!store) return;
    return store.subscribe(() => force((n) => n + 1));
  }, []);

  const store = mounted ? getStore() : null;
  const url = id && store ? store.get(id) : undefined;

  const upload = useCallback(
    (file: File) => {
      if (!file || !id) return;
      const store = getStore();
      if (!store) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result === 'string') store.set(id, result);
      };
      reader.readAsDataURL(file);
    },
    [id]
  );

  const remove = useCallback(() => {
    if (!id) return;
    getStore()?.remove(id);
  }, [id]);

  return { url, upload, remove };
}

/* ─── Component ─────────────────────────────────────────────────────── */

type Variant = 'rsv' | 'card' | 'sm' | 'lg' | 'circle-sm' | 'circle';

interface CustomerPhotoProps {
  id: string;
  name?: string;
  variant?: Variant;
  uploadable?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export function CustomerPhoto({
  id,
  name,
  variant = 'rsv',
  uploadable = true,
  onClick,
}: CustomerPhotoProps) {
  const { url, upload } = useCustomerPhoto(id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick(e);
      return;
    }
    if (!uploadable) return;
    e.stopPropagation();
    inputRef.current?.click();
  };

  const onDrop = (e: React.DragEvent) => {
    if (!uploadable) return;
    e.preventDefault();
    e.stopPropagation();
    setDrag(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) upload(f);
  };

  return (
    <div
      className={`srk-cphoto srk-cphoto-${variant} ${url ? 'has-photo' : ''} ${drag ? 'is-drag' : ''} ${uploadable ? 'is-uploadable' : ''}`}
      onClick={handleClick}
      onDragOver={
        uploadable
          ? (e) => {
              e.preventDefault();
              setDrag(true);
            }
          : undefined
      }
      onDragLeave={uploadable ? () => setDrag(false) : undefined}
      onDrop={uploadable ? onDrop : undefined}
      title={uploadable ? '画像をクリックまたはドロップ' : undefined}
    >
      {url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={url} alt={name || ''} />
      ) : (
        <span className="srk-cphoto-initial">{name?.[0] || '？'}</span>
      )}
      {uploadable && (
        <span className="srk-cphoto-overlay">
          <Icon name="plus" size={11} />
        </span>
      )}
      {uploadable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) upload(f);
            e.target.value = '';
          }}
        />
      )}
    </div>
  );
}
