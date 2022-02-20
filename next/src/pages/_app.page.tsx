import "../styles/globals.css";
import type { AppProps } from "next/app";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useState } from "react";
import "../styles/index.css";
import "../styles/custom.scss";
import UserContext from "../components/UserContext";
import Head from "next/head";

function MyApp({ Component, pageProps }: AppProps) {
  const [userData, setUserData] = useState({ isLoggedOn: false });

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        <meta
          name="description"
          content="Queerburners, bringing together LGBTQIA+ participants at Burning Man"
        />
        <title>Queerburners</title>
      </Head>
      <UserContext.Provider value={{ userData, setUserData }}>
        <Header />
        <Component {...pageProps} />
        <Footer />
      </UserContext.Provider>
    </>
  );
}

export default MyApp;
