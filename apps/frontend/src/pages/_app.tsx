import type { AppProps } from 'next/app';
import { ApolloWrapper } from '@/components/ApolloWrapper';
import { ThemeRegistry } from '@/components/ThemeRegistry';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeRegistry>
      <ApolloWrapper>
        <Component {...pageProps} />
      </ApolloWrapper>
    </ThemeRegistry>
  );
}

