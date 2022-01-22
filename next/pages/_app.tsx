import "../styles/globals.css";
import type { AppProps } from "next/app";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useState } from "react";
import "../styles/index.css";
import "../styles/custom.scss";

function MyApp({ Component, pageProps }: AppProps) {
  const [userData, setUserData] = useState({ isLoggedOn: false });

  return (
    <>
      <Header
        userData={userData}
        OnUserDataChange={(newUserData: any) => {
          setUserData(newUserData);
        }}
      />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp;
