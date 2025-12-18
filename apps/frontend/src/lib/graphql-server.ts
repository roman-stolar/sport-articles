const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

async function fetchGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<T> {
  const response = await fetch(GRAPHQL_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    cache: 'no-store',
  });

  const result = await response.json();

  if (result.errors) {
    throw new Error(result.errors[0]?.message || 'GraphQL error');
  }

  return result.data;
}

const GET_ARTICLES_QUERY = `
  query GetArticles($limit: Int, $offset: Int) {
    articles(limit: $limit, offset: $offset) {
      articles {
        id
        title
        content
        createdAt
        deletedAt
        imageUrl
      }
      totalCount
      hasMore
    }
  }
`;

const GET_ARTICLE_QUERY = `
  query GetArticle($id: ID!) {
    article(id: $id) {
      id
      title
      content
      createdAt
      deletedAt
      imageUrl
    }
  }
`;

export interface SportsArticle {
  id: string;
  title: string;
  content: string;
  createdAt: string | null;
  deletedAt: string | null;
  imageUrl: string | null;
}

export interface PaginatedArticles {
  articles: SportsArticle[];
  totalCount: number;
  hasMore: boolean;
}

export async function getArticles(limit = 10, offset = 0): Promise<PaginatedArticles> {
  const data = await fetchGraphQL<{ articles: PaginatedArticles }>(GET_ARTICLES_QUERY, {
    limit,
    offset,
  });
  return data.articles;
}

export async function getArticle(id: string): Promise<SportsArticle | null> {
  const data = await fetchGraphQL<{ article: SportsArticle | null }>(GET_ARTICLE_QUERY, { id });
  return data.article;
}
