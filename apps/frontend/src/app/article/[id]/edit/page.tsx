'use client';

import { useQuery, useMutation } from '@apollo/client';
import { GET_ARTICLE, UPDATE_ARTICLE, GET_ARTICLES } from '@/lib/graphql/queries';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Alert,
  CircularProgress,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useArticles } from '@/lib/ArticlesContext';

const updateArticleSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z.string().url('Image URL must be a valid URL').optional().or(z.literal('')),
});

type UpdateArticleFormData = z.infer<typeof updateArticleSchema>;

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { reset } = useArticles();

  const { data, loading: queryLoading, error: queryError } = useQuery(GET_ARTICLE, {
    variables: { id },
    skip: !id,
  });

  const [updateArticle, { loading: mutationLoading, error: mutationError }] = useMutation(
    UPDATE_ARTICLE,
    {
      refetchQueries: [
        { query: GET_ARTICLES, variables: { limit: 10, offset: 0 } },
        { query: GET_ARTICLE, variables: { id } },
      ],
      awaitRefetchQueries: true,
      onCompleted: () => {
        reset();
        router.push(`/article/${id}`);
        router.refresh();
      },
    }
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<UpdateArticleFormData>({
    resolver: zodResolver(updateArticleSchema),
    values: data?.article
      ? {
          title: data.article.title,
          content: data.article.content,
          imageUrl: data.article.imageUrl || '',
        }
      : undefined,
  });

  const onSubmit = async (formData: UpdateArticleFormData) => {
    try {
      await updateArticle({
        variables: {
          id,
          input: {
            title: formData.title,
            content: formData.content,
            imageUrl: formData.imageUrl || undefined,
          },
        },
      });
    } catch (err) {
      console.error('Error updating article:', err);
    }
  };

  if (queryLoading) {
    return (
      <Box component="main" sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
            <CircularProgress />
          </Box>
        </Container>
      </Box>
    );
  }

  if (queryError || !data?.article) {
    return (
      <Box component="main" sx={{ minHeight: '100vh', py: 4 }}>
        <Container maxWidth="md">
          <Alert severity="error">
            <Typography fontWeight="bold">Article not found</Typography>
            <Button
              component={Link}
              href="/"
              startIcon={<ArrowBackIcon />}
              sx={{ mt: 1 }}
            >
              Back to Articles
            </Button>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box component="main" sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ mb: 4 }}>
          <Button
            component={Link}
            href={`/article/${id}`}
            startIcon={<ArrowBackIcon />}
            sx={{ mb: 2 }}
          >
            Back to Article
          </Button>
          <Typography variant="h3" component="h1" fontWeight="bold">
            Edit Article
          </Typography>
        </Box>

        <Paper sx={{ p: 4 }}>
          {mutationError && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {mutationError.message || 'Failed to update article'}
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
                <Button component={Link} href={`/article/${id}`}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" disabled={mutationLoading}>
                  {mutationLoading ? 'Updating...' : 'Update Article'}
                </Button>
              </Box>
            </Box>
          </form>
        </Paper>
      </Container>
    </Box>
  );
}
