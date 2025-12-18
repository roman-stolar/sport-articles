import { gql } from '@apollo/client';

export const GET_ARTICLES = gql`
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

export const GET_ARTICLE = gql`
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

export const CREATE_ARTICLE = gql`
  mutation CreateArticle($input: ArticleInput!) {
    createArticle(input: $input) {
      id
      title
      content
      createdAt
      deletedAt
      imageUrl
    }
  }
`;

export const UPDATE_ARTICLE = gql`
  mutation UpdateArticle($id: ID!, $input: ArticleInput!) {
    updateArticle(id: $id, input: $input) {
      id
      title
      content
      createdAt
      deletedAt
      imageUrl
    }
  }
`;

export const DELETE_ARTICLE = gql`
  mutation DeleteArticle($id: ID!) {
    deleteArticle(id: $id)
  }
`;
