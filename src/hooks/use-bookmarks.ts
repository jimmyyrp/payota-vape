'use client';

import { useState, useEffect, useCallback } from 'react';

const BOOKMARK_EVENT = 'fee-bookmarks-updated';

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  const loadBookmarks = useCallback(() => {
    const saved = localStorage.getItem('fee_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    } else {
      setBookmarks([]);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    loadBookmarks();

    const handleUpdate = () => {
      loadBookmarks();
    };

    const handleStorageUpdate = (e: StorageEvent) => {
      if (e.key === 'fee_bookmarks') {
        loadBookmarks();
      }
    };

    window.addEventListener(BOOKMARK_EVENT, handleUpdate);
    window.addEventListener('storage', handleStorageUpdate);

    return () => {
      window.removeEventListener(BOOKMARK_EVENT, handleUpdate);
      window.removeEventListener('storage', handleStorageUpdate);
    };
  }, [loadBookmarks]);

  const toggleBookmark = (id: string) => {
    const saved = localStorage.getItem('fee_bookmarks');
    let current: string[] = [];
    if (saved) {
      try {
        current = JSON.parse(saved);
      } catch (e) {}
    }

    const next = current.includes(id)
      ? current.filter((b) => b !== id)
      : [...current, id];
    
    localStorage.setItem('fee_bookmarks', JSON.stringify(next));
    setBookmarks(next);
    
    window.dispatchEvent(new Event(BOOKMARK_EVENT));
  };

  const isBookmarked = (id: string) => bookmarks.includes(id);

  return { bookmarks, toggleBookmark, isBookmarked, mounted };
}