import { GetServerSideProps } from 'next';
import { EditArticleContent } from '@/components/EditArticleContent';

interface EditArticlePageProps {
  articleId: string;
}

export default function EditArticlePage({ articleId }: EditArticlePageProps) {
  return <EditArticleContent articleId={articleId} />;
}

export const getServerSideProps: GetServerSideProps<EditArticlePageProps> = async ({ params }) => {
  const articleId = params?.articleId as string;
  if (!articleId) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      articleId,
    },
  };
};

