import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { createApolloClient } from './apollo-config';

let apolloServerClient: ApolloClient<NormalizedCacheObject> | null = null;

export function getClient() {
  if (!apolloServerClient) {
    apolloServerClient = createApolloClient({
      ssrMode: true,
      defaultOptions: {
        query: {
          fetchPolicy: 'no-cache',
        },
      },
    });
  }
  return apolloServerClient;
}

