import { getArticle } from '@/lib/graphql-server';
import { notFound } from 'next/navigation';
import { ArticleDetailContent } from '@/components/ArticleDetailContent';

interface ArticlePageProps {
  params: {
    id: string;
  };
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await getArticle(params.id);

  if (!article) {
    notFound();
  }

  return <ArticleDetailContent article={article} />;
}
