import { GetServerSideProps } from 'next';
import { getClient } from '@/lib/apollo-server-client';
import { GET_ARTICLE } from '@/lib/graphql/queries';
import { ArticleDetailContent } from '@/components/ArticleDetailContent';
import { SportsArticle } from '@/types/article';

interface ArticlePageProps {
  article: SportsArticle | null;
}

export default function ArticlePage({ article }: ArticlePageProps) {
  if (!article) {
    return <div>Article not found</div>;
  }

  return <ArticleDetailContent article={article} />;
}

export const getServerSideProps: GetServerSideProps<ArticlePageProps> = async ({ params }) => {
  try {
    const articleId = params?.articleId as string;
    if (!articleId) {
      return {
        notFound: true,
      };
    }

    const client = getClient();
    const { data } = await client.query({
      query: GET_ARTICLE,
      variables: { id: articleId },
      fetchPolicy: 'no-cache',
    });

    if (!data.article) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        article: data.article,
      },
    };
  } catch (error) {
    console.error('Error fetching article:', error);
    return {
      notFound: true,
    };
  }
};

