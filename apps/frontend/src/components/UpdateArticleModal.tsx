'use client';

import { useMutation } from '@apollo/client';
import { UPDATE_ARTICLE, GET_ARTICLES } from '@/lib/graphql/queries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { SportsArticle } from '@/lib/graphql-server';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Alert,
  Box,
} from '@mui/material';

const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),
});

type UpdateArticleFormData = z.infer<typeof updateArticleSchema>;

interface UpdateArticleModalProps {
  article: SportsArticle;
  onClose: (updated?: boolean) => void;
}

export function UpdateArticleModal({ article, onClose }: UpdateArticleModalProps) {
  const [updateArticle, { loading, error }] = useMutation(UPDATE_ARTICLE, {
    refetchQueries: [{ query: GET_ARTICLES, variables: { limit: 10, offset: 0 } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      onClose(true);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateArticleFormData>({
    resolver: zodResolver(updateArticleSchema),
    defaultValues: {
      title: article.title,
      content: article.content,
      imageUrl: article.imageUrl || '',
    },
  });

  const onSubmit = async (data: UpdateArticleFormData) => {
    try {
      await updateArticle({
        variables: {
          id: article.id,
          input: {
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl || undefined,
          },
        },
      });
    } catch (err) {
      console.error('Error updating article:', err);
    }
  };

  return (
    <Dialog open onClose={() => onClose()} maxWidth="md" fullWidth>
      <DialogTitle>Update Article</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error.message || 'Failed to update article'}
            </Alert>
          )}

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Title"
              fullWidth
              required
              {...register('title')}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="Content"
              fullWidth
              required
              multiline
              rows={8}
              {...register('content')}
              error={!!errors.content}
              helperText={errors.content?.message}
            />

            <TextField
              label="Image URL (optional)"
              fullWidth
              type="url"
              {...register('imageUrl')}
              error={!!errors.imageUrl}
              helperText={errors.imageUrl?.message}
              placeholder="https://example.com/image.jpg"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => onClose()} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={loading}>
            {loading ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
