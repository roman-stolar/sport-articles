'use client';

import { useQuery } from '@apollo/client';
import { GET_ARTICLES } from '@/lib/graphql/queries';
import { useState, useCallback, useEffect } from 'react';
import { UpdateArticleModal } from './UpdateArticleModal';
import { DeleteArticleModal } from './DeleteArticleModal';
import Link from 'next/link';
import { ArticleImage } from './ArticleImage';
import { SportsArticle } from '@/lib/graphql-server';
import { useArticles } from '@/lib/ArticlesContext';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const PAGE_SIZE = 10;

interface ArticlesListProps {
  initialArticles: SportsArticle[];
  initialHasMore: boolean;
  initialTotalCount: number;
}

interface ArticlesQueryData {
  articles: {
    articles: SportsArticle[];
    totalCount: number;
    hasMore: boolean;
  };
}

export function ArticlesList({
  initialArticles,
  initialHasMore,
  initialTotalCount,
}: ArticlesListProps) {
  const { state, setArticles, appendArticles } = useArticles();
  const [loadingMore, setLoadingMore] = useState(false);
  const [editingArticle, setEditingArticle] = useState<SportsArticle | null>(null);
  const [deletingArticle, setDeletingArticle] = useState<SportsArticle | null>(null);

  const articles = state.isInitialized ? state.articles : initialArticles;
  const hasMore = state.isInitialized ? state.hasMore : initialHasMore;
  const totalCount = state.isInitialized ? state.totalCount : initialTotalCount;

  useEffect(() => {
    if (!state.isInitialized) {
      setArticles(initialArticles, initialHasMore, initialTotalCount);
    }
  }, [state.isInitialized, initialArticles, initialHasMore, initialTotalCount, setArticles]);

  const { loading, error, client } = useQuery<ArticlesQueryData>(GET_ARTICLES, {
    variables: { limit: PAGE_SIZE, offset: 0 },
    fetchPolicy: 'cache-and-network',
    notifyOnNetworkStatusChange: true,
    skip: state.isInitialized,
  });

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;

    setLoadingMore(true);
    try {
      const result = await client.query<ArticlesQueryData>({
        query: GET_ARTICLES,
        variables: { limit: PAGE_SIZE, offset: articles.length },
        fetchPolicy: 'network-only',
      });

      const newArticles = result.data.articles.articles;
      appendArticles(newArticles, result.data.articles.hasMore, result.data.articles.totalCount);
    } catch (err) {
      console.error('Error loading more articles:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [client, articles.length, hasMore, loadingMore, appendArticles]);

  const handleRefresh = useCallback(async () => {
    try {
      const result = await client.query<ArticlesQueryData>({
        query: GET_ARTICLES,
        variables: { limit: PAGE_SIZE, offset: 0 },
        fetchPolicy: 'network-only',
      });
      if (result.data) {
        setArticles(
          result.data.articles.articles,
          result.data.articles.hasMore,
          result.data.articles.totalCount
        );
      }
    } catch (err) {
      console.error('Error refreshing articles:', err);
    }
  }, [client, setArticles]);

  const handleEditClose = useCallback(
    (updated?: boolean) => {
      setEditingArticle(null);
      if (updated) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  const handleDeleteClose = useCallback(
    (deleted?: boolean) => {
      setDeletingArticle(null);
      if (deleted) {
        handleRefresh();
      }
    },
    [handleRefresh]
  );

  if (loading && articles.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error && articles.length === 0) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        <Typography fontWeight="bold">Error loading articles</Typography>
        <Typography variant="body2">{error.message || 'An unexpected error occurred'}</Typography>
      </Alert>
    );
  }

  if (articles.length === 0) {
    return (
      <Paper sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No articles found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Create your first article to get started
        </Typography>
      </Paper>
    );
  }

  return (
    <>
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          Showing {articles.length} of {totalCount} articles
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {articles.map((article) => (
          <Grid item xs={12} sm={6} md={4} key={article.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.3s',
                '&:hover': {
                  boxShadow: 6,
                },
              }}
            >
              <ArticleImage src={article.imageUrl} alt={article.title} height={200} />
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  component={Link}
                  href={`/article/${article.id}`}
                  sx={{
                    textDecoration: 'none',
                    color: 'text.primary',
                    display: 'block',
                    mb: 1,
                    '&:hover': {
                      color: 'primary.main',
                    },
                  }}
                >
                  {article.title}
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    mb: 2,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {article.content}
                </Typography>
                {article.createdAt && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                    sx={{ mb: 2 }}
                  >
                    {new Date(article.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                  <Button
                    size="small"
                    startIcon={<EditIcon />}
                    onClick={() => setEditingArticle(article)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteIcon />}
                    onClick={() => setDeletingArticle(article)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {hasMore && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <Button
            variant="outlined"
            size="large"
            onClick={loadMore}
            disabled={loadingMore}
            startIcon={loadingMore ? <CircularProgress size={20} /> : <ExpandMoreIcon />}
          >
            {loadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}

      {editingArticle && (
        <UpdateArticleModal article={editingArticle} onClose={handleEditClose} />
      )}

      {deletingArticle && (
        <DeleteArticleModal article={deletingArticle} onClose={handleDeleteClose} />
      )}
    </>
  );
}
