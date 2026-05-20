import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface BookmarkContextType {
  bookmarkedIds: string[];
  addBookmark: (id: string) => void;
  removeBookmark: (id: string) => void;
  isBookmarked: (id: string) => boolean;
}

const BookmarkContext = createContext<BookmarkContextType | undefined>(undefined);

export const BookmarkProvider = ({ children }: { children: ReactNode }) => {
  const [bookmarkedIds, setBookmarkedIds] = useState<string[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('tsukuhub_bookmarks');
    if (saved) {
      try {
        setBookmarkedIds(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse bookmarks", e);
      }
    }
  }, []);

  const saveBookmarks = (newBookmarks: string[]) => {
    setBookmarkedIds(newBookmarks);
    localStorage.setItem('tsukuhub_bookmarks', JSON.stringify(newBookmarks));
  };

  const addBookmark = (id: string) => {
    if (!bookmarkedIds.includes(id)) {
      saveBookmarks([...bookmarkedIds, id]);
    }
  };

  const removeBookmark = (id: string) => {
    saveBookmarks(bookmarkedIds.filter(bId => bId !== id));
  };

  const isBookmarked = (id: string) => {
    return bookmarkedIds.includes(id);
  };

  return (
    <BookmarkContext.Provider value={{ bookmarkedIds, addBookmark, removeBookmark, isBookmarked }}>
      {children}
    </BookmarkContext.Provider>
  );
};

export const useBookmarks = () => {
  const context = useContext(BookmarkContext);
  if (context === undefined) {
    throw new Error('useBookmarks must be used within a BookmarkProvider');
  }
  return context;
};
