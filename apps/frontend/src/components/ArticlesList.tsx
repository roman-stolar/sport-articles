'use client';

import { useQuery, useApolloClient } from '@apollo/client';
import { GET_ARTICLES } from '@/lib/graphql/queries';
import { useState, useCallback, useEffect } from 'react';
import { DeleteArticleModal } from './DeleteArticleModal';
import Link from 'next/link';
import { ArticleImage } from './ArticleImage';
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
import { SportsArticle } from '@/types/article';

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
  const [deletingArticle, setDeletingArticle] = useState<SportsArticle | null>(null);
  const client = useApolloClient();

  useEffect(() => {
    client.writeQuery<ArticlesQueryData>({
      query: GET_ARTICLES,
      variables: { limit: PAGE_SIZE, offset: 0 },
      data: {
        articles: {
          articles: initialArticles,
          totalCount: initialTotalCount,
          hasMore: initialHasMore,
        },
      },
    });
  }, [client, initialArticles, initialHasMore, initialTotalCount]);

  const { data, loading, error, fetchMore } = useQuery<ArticlesQueryData>(GET_ARTICLES, {
    variables: { limit: PAGE_SIZE, offset: 0 },
    fetchPolicy: 'cache-first',
    notifyOnNetworkStatusChange: true,
  });

  const articles = data?.articles?.articles || initialArticles;
  const hasMore = data?.articles?.hasMore ?? initialHasMore;
  const totalCount = data?.articles?.totalCount ?? initialTotalCount;
  const isLoadingMore = loading && articles.length > 0;

  const loadMore = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;

    try {
      await fetchMore({
        variables: {
          limit: PAGE_SIZE,
          offset: articles.length,
        },
        updateQuery: (prev, { fetchMoreResult }) => {
          if (!fetchMoreResult) return prev;
          return {
            articles: {
              ...fetchMoreResult.articles,
              articles: [...prev.articles.articles, ...fetchMoreResult.articles.articles],
            },
          };
        },
      });
    } catch (err) {
      console.error('Error loading more articles:', err);
    }
  }, [fetchMore, articles.length, hasMore, isLoadingMore]);

  const handleDeleteClose = useCallback(
    (deleted?: boolean) => {
      setDeletingArticle(null);
    },
    []
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
                    component={Link}
                    href={`/article/${article.id}/edit`}
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
            disabled={isLoadingMore}
            startIcon={isLoadingMore ? <CircularProgress size={20} /> : <ExpandMoreIcon />}
          >
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Button>
        </Box>
      )}

      {deletingArticle && (
        <DeleteArticleModal article={deletingArticle} onClose={handleDeleteClose} />
      )}
    </>
  );
}
