'use client';

import { useMutation } from '@apollo/client';
import { DELETE_ARTICLE, GET_ARTICLES } from '@/lib/graphql/queries';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
  Typography,
  Paper,
} from '@mui/material';
import { SportsArticle } from '@/types/article';

interface DeleteArticleModalProps {
  article: SportsArticle;
  onClose: (deleted?: boolean) => void;
}

export function DeleteArticleModal({ article, onClose }: DeleteArticleModalProps) {
  const [deleteArticle, { loading, error }] = useMutation(DELETE_ARTICLE, {
    refetchQueries: [{ query: GET_ARTICLES, variables: { limit: 10, offset: 0 } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onClose(true);
    },
  });

  const handleDelete = async () => {
    try {
      await deleteArticle({
        variables: {
          id: article.id,
        },
      });
    } catch (err) {
      console.error('Error deleting article:', err);
    }
  };

  return (
    <Dialog open onClose={() => onClose()} maxWidth="sm" fullWidth>
      <DialogTitle>Delete Article</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error.message || 'Failed to delete article'}
          </Alert>
        )}

        <Typography sx={{ mb: 2 }}>
          Are you sure you want to delete this article?
        </Typography>

        <Paper variant="outlined" sx={{ p: 2 }}>
          <Typography variant="body2" color="text.secondary">
            <strong>Title:</strong> {article.title}
          </Typography>
          {article.createdAt && (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              <strong>Created:</strong>{' '}
              {new Date(article.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>
          )}
        </Paper>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onClose()} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleDelete}
          variant="contained"
          color="error"
          disabled={loading}
        >
          {loading ? 'Deleting...' : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
