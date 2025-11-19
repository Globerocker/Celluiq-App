import { LanguageProvider } from '../components/LanguageProvider';

export default function MyApp({ Component, pageProps }) {
  return (
    <LanguageProvider>
      <Component {...pageProps} />
    </LanguageProvider>
  );
}