import { Html, Head, Main, NextScript } from 'next/document'
import { getAssetPath } from '../utils/assetHelpers'

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <link rel="icon" href={getAssetPath("/favicon.png")} />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="true" />
        <link 
          href="https://fonts.googleapis.com/css2?family=Oswald:wght@300;400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap" 
          rel="stylesheet" 
        />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}