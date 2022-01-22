import "../styles/globals.css";
import type { AppProps } from "next/app";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useState } from "react";
import "../styles/index.css";
import "../styles/custom.scss";
import UserContext from "../components/UserContext";

function MyApp({ Component, pageProps }: AppProps) {
  const [userData, setUserData] = useState({ isLoggedOn: false });

  return (
    <UserContext.Provider value={{ userData, setUserData }}>
      <Header />
      <Component {...pageProps} />
      <Footer />
    </UserContext.Provider>
  );
}

export default MyApp;
