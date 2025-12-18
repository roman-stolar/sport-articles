'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { SportsArticle } from './graphql-server';

interface ArticlesState {
  articles: SportsArticle[];
  hasMore: boolean;
  totalCount: number;
  isInitialized: boolean;
}

interface ArticlesContextType {
  state: ArticlesState;
  setArticles: (articles: SportsArticle[], hasMore: boolean, totalCount: number) => void;
  appendArticles: (newArticles: SportsArticle[], hasMore: boolean, totalCount: number) => void;
  reset: () => void;
}

const ArticlesContext = createContext<ArticlesContextType | null>(null);

const initialState: ArticlesState = {
  articles: [],
  hasMore: false,
  totalCount: 0,
  isInitialized: false,
};

export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ArticlesState>(initialState);

  const setArticles = useCallback(
    (articles: SportsArticle[], hasMore: boolean, totalCount: number) => {
      setState({
        articles,
        hasMore,
        totalCount,
        isInitialized: true,
      });
    },
    []
  );

  const appendArticles = useCallback(
    (newArticles: SportsArticle[], hasMore: boolean, totalCount: number) => {
      setState((prev) => ({
        articles: [...prev.articles, ...newArticles],
        hasMore,
        totalCount,
        isInitialized: true,
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setState(initialState);
  }, []);

  return (
    <ArticlesContext.Provider value={{ state, setArticles, appendArticles, reset }}>
      {children}
    </ArticlesContext.Provider>
  );
}

export function useArticles() {
  const context = useContext(ArticlesContext);
  if (!context) {
    throw new Error('useArticles must be used within an ArticlesProvider');
  }
  return context;
}

