import { GetServerSideProps } from 'next';
import { getClient } from '@/lib/apollo-server-client';
import { GET_ARTICLES } from '@/lib/graphql/queries';
import { HomePageContent } from '@/components/HomePageContent';
import { SportsArticle } from '@/types/article';

interface HomeProps {
  initialArticles: SportsArticle[];
  initialHasMore: boolean;
  initialTotalCount: number;
}

export default function Home({ initialArticles, initialHasMore, initialTotalCount }: HomeProps) {
  return (
    <HomePageContent
      initialArticles={initialArticles}
      initialHasMore={initialHasMore}
      initialTotalCount={initialTotalCount}
    />
  );
}

export const getServerSideProps: GetServerSideProps<HomeProps> = async () => {
  try {
    const client = getClient();
    const { data } = await client.query({
      query: GET_ARTICLES,
      variables: { limit: 10, offset: 0 },
      fetchPolicy: 'no-cache',
    });

    return {
      props: {
        initialArticles: data.articles.articles,
        initialHasMore: data.articles.hasMore,
        initialTotalCount: data.articles.totalCount,
      },
    };
  } catch (error) {
    console.error('Error fetching articles:', error);
    return {
      props: {
        initialArticles: [],
        initialHasMore: false,
        initialTotalCount: 0,
      },
    };
  }
};

