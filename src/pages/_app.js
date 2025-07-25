import Navigation from '../components/Navigation/Navigation';
import '../styles/globals.css';
import '../styles/variables.css';

export default function App({ Component, pageProps }) {
  return (
    <>
      <Navigation />
      <main id="main-content" className="container">
        <Component {...pageProps} />
      </main>
    </>
  );
}