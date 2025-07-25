import Navigation from '../components/Navigation/Navigation';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navigation />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1rem' }}>
        <Component {...pageProps} />
      </main>
    </>
  );
}