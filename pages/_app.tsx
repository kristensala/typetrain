import '../styles/globals.scss'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import '../styles/pages/Home.scss';

import '../styles/components/GameStatistics.scss';


function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <link rel="preconnect" href="https://fonts.googleapis.com"/>
        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@200;300;400" rel="stylesheet"/>
      </Head>
      <Component {...pageProps} />
    </>
  )
}

export default MyApp
