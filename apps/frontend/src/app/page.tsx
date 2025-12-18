import { getArticles } from '@/lib/graphql-server';
import { HomePageContent } from '@/components/HomePageContent';

export default async function Home() {
  const initialData = await getArticles(10, 0);

  return (
    <HomePageContent
      initialArticles={initialData.articles}
      initialHasMore={initialData.hasMore}
      initialTotalCount={initialData.totalCount}
    />
  );
}
