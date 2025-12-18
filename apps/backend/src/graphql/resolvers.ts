import { DataSource, Repository, IsNull } from 'typeorm';
import { GraphQLError } from 'graphql';
import { z } from 'zod';
import { SportsArticle } from '../entities/SportsArticle';

const articleInputSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  content: z.string().min(1, 'Content is required'),
  imageUrl: z
    .union([z.string().url('Image URL must be a valid URL'), z.literal('')])
    .optional()
    .transform((val) => (val === '' || !val ? undefined : val)),
});

interface Context {
  dataSource: DataSource;
  articleRepository: Repository<SportsArticle>;
}

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

export const resolvers = {
  Query: {
    articles: async (
      _: unknown,
      { limit, offset }: { limit?: number; offset?: number },
      context: Context
    ) => {
      try {
        const take = Math.min(limit || DEFAULT_LIMIT, MAX_LIMIT);
        const skip = offset || 0;

        const [articles, totalCount] = await context.articleRepository.findAndCount({
          where: {
            deletedAt: IsNull(),
          },
          order: { createdAt: 'DESC' },
          take,
          skip,
        });

        const formattedArticles = articles.map((article) => ({
          ...article,
          createdAt: article.createdAt?.toISOString() || null,
          deletedAt: article.deletedAt?.toISOString() || null,
        }));

        return {
          articles: formattedArticles,
          totalCount,
          hasMore: skip + articles.length < totalCount,
        };
      } catch (error) {
        throw new GraphQLError('Failed to fetch articles', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    article: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        const article = await context.articleRepository.findOne({
          where: {
            id,
            deletedAt: IsNull(),
          },
        });

        if (!article) {
          throw new GraphQLError('Article not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        return {
          ...article,
          createdAt: article.createdAt?.toISOString() || null,
          deletedAt: article.deletedAt?.toISOString() || null,
        };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to fetch article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },

  Mutation: {
    createArticle: async (
      _: unknown,
      { input }: { input: { title: string; content: string; imageUrl?: string } },
      context: Context
    ) => {
      try {
        const validatedInput = articleInputSchema.parse(input);

        const article = context.articleRepository.create({
          title: validatedInput.title,
          content: validatedInput.content,
          imageUrl: validatedInput.imageUrl || undefined,
        });

        const savedArticle = await context.articleRepository.save(article);

        return {
          ...savedArticle,
          createdAt: savedArticle.createdAt?.toISOString() || null,
          deletedAt: savedArticle.deletedAt?.toISOString() || null,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new GraphQLError(error.errors[0].message, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        throw new GraphQLError('Failed to create article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    updateArticle: async (
      _: unknown,
      { id, input }: { id: string; input: { title: string; content: string; imageUrl?: string } },
      context: Context
    ) => {
      try {
        const validatedInput = articleInputSchema.parse(input);

        const existing = await context.articleRepository.findOne({
          where: {
            id,
            deletedAt: IsNull(),
          },
        });

        if (!existing) {
          throw new GraphQLError('Article not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        existing.title = validatedInput.title;
        existing.content = validatedInput.content;
        existing.imageUrl = validatedInput.imageUrl || undefined;

        const article = await context.articleRepository.save(existing);

        return {
          ...article,
          createdAt: article.createdAt?.toISOString() || null,
          deletedAt: article.deletedAt?.toISOString() || null,
        };
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        if (error instanceof z.ZodError) {
          throw new GraphQLError(error.errors[0].message, {
            extensions: { code: 'BAD_USER_INPUT' },
          });
        }
        throw new GraphQLError('Failed to update article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },

    deleteArticle: async (_: unknown, { id }: { id: string }, context: Context) => {
      try {
        const existing = await context.articleRepository.findOne({
          where: {
            id,
            deletedAt: IsNull(),
          },
        });

        if (!existing) {
          throw new GraphQLError('Article not found', {
            extensions: { code: 'NOT_FOUND' },
          });
        }

        existing.deletedAt = new Date();
        await context.articleRepository.save(existing);

        return true;
      } catch (error) {
        if (error instanceof GraphQLError) {
          throw error;
        }
        throw new GraphQLError('Failed to delete article', {
          extensions: { code: 'INTERNAL_SERVER_ERROR' },
        });
      }
    },
  },
};
