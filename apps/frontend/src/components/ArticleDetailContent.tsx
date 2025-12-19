'use client';

import Link from 'next/link';
import { ArticleImage } from './ArticleImage';
import { Box, Container, Typography, Paper, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { SportsArticle } from '@/types/article';

interface ArticleDetailContentProps {
  article: SportsArticle;
}

export function ArticleDetailContent({ article }: ArticleDetailContentProps) {
  return (
    <Box component="main" sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="md">
        <Button
          component={Link}
          href="/"
          startIcon={<ArrowBackIcon />}
          sx={{ mb: 2 }}
        >
          Back to Articles
        </Button>

        <Paper sx={{ overflow: 'hidden' }}>
          <Box sx={{ height: 400 }}>
            <ArticleImage
              src={article.imageUrl}
              alt={article.title}
              fill
              priority
            />
          </Box>
          <Box sx={{ p: 4 }}>
            <Typography variant="h3" component="h1" fontWeight="bold" gutterBottom>
              {article.title}
            </Typography>
            {article.createdAt && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Published on{' '}
                {new Date(article.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Typography>
            )}
            <Typography
              variant="body1"
              sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}
            >
              {article.content}
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

