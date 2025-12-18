'use client';

import { useMutation } from '@apollo/client';
import { CREATE_ARTICLE, GET_ARTICLES } from '@/lib/graphql/queries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useArticles } from '@/lib/ArticlesContext';

const createArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),
});

type CreateArticleFormData = z.infer<typeof createArticleSchema>;

export default function CreateArticlePage() {
  const router = useRouter();
  const { reset } = useArticles();
  const [createArticle, { loading, error }] = useMutation(CREATE_ARTICLE, {
    refetchQueries: [{ query: GET_ARTICLES, variables: { limit: 10, offset: 0 } }],
    awaitRefetchQueries: true,
    onCompleted: () => {
      reset();
      router.push('/');
      router.refresh();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateArticleFormData>({
    resolver: zodResolver(createArticleSchema),
  });

  const onSubmit = async (data: CreateArticleFormData) => {
    try {
      await createArticle({
        variables: {
          input: {
            title: data.title,
            content: data.content,
            imageUrl: data.imageUrl || undefined,
          },
        },
      });
    } catch (err) {
      console.error('Error creating article:', err);
    }
  };

  return (
    <Box component="main" sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Articles
          </Button>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Create New Article
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error.message || 'Failed to create article'}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
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
                rows={12}
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

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2, mt: 2 }}>
                <Button component={Link} href="/">
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Article'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
