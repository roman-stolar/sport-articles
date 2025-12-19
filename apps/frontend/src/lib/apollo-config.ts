import { ApolloClient, ApolloClientOptions, InMemoryCache, createHttpLink, NormalizedCacheObject } from '@apollo/client';

const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:4000/graphql';

export function createApolloClient(
  options?: Partial<ApolloClientOptions<NormalizedCacheObject>>
): ApolloClient<NormalizedCacheObject> {
  return new ApolloClient({
    link: createHttpLink({
      uri: GRAPHQL_URL,
      fetchOptions: options?.ssrMode ? { cache: 'no-store' } : undefined,
    }),
    cache: new InMemoryCache(),
    ...options,
  });
}

