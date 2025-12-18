export const typeDefs = `#graphql
  type SportsArticle {
    id: ID!
    title: String!
    content: String!
    createdAt: String
    deletedAt: String
    imageUrl: String
  }

  type PaginatedArticles {
    articles: [SportsArticle!]!
    totalCount: Int!
    hasMore: Boolean!
  }

  input ArticleInput {
    title: String!
    content: String!
    imageUrl: String
  }

  type Query {
    articles(limit: Int, offset: Int): PaginatedArticles!
    article(id: ID!): SportsArticle
  }

  type Mutation {
    createArticle(input: ArticleInput!): SportsArticle!
    updateArticle(id: ID!, input: ArticleInput!): SportsArticle!
    deleteArticle(id: ID!): Boolean!
  }
`;
