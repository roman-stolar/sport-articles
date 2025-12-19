'use client';

import { Box, Container, Typography, Button } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import Link from 'next/link';
import { ArticlesList } from './ArticlesList';
import { SportsArticle } from '@/types/article';

interface HomePageContentProps {
  initialArticles: SportsArticle[];
  initialHasMore: boolean;
  initialTotalCount: number;
}

export function HomePageContent({
  initialArticles,
  initialHasMore,
  initialTotalCount,
}: HomePageContentProps) {
  return (
    <Box component="main" sx={{ minHeight: '100vh', py: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h3" component="h1" fontWeight="bold">
            Sports Articles
          </Typography>
          <Button
            component={Link}
            href="/create"
            variant="contained"
            startIcon={<AddIcon />}
            size="large"
          >
            Create Article
          </Button>
        </Box>

        <ArticlesList
          initialArticles={initialArticles}
          initialHasMore={initialHasMore}
          initialTotalCount={initialTotalCount}
        />
      </Container>
    </Box>
  );
}

