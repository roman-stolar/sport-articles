import type { Metadata } from 'next';
import './globals.css';
import { ApolloWrapper } from '@/components/ApolloWrapper';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import { ArticlesProvider } from '@/lib/ArticlesContext';

export const metadata: Metadata = {
  title: 'Sports Articles',
  description: 'Manage and read sports articles',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeRegistry>
          <ApolloWrapper>
            <ArticlesProvider>{children}</ArticlesProvider>
          </ApolloWrapper>
        </ThemeRegistry>
      </body>
    </html>
  );
}
