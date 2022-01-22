import type { NextPage } from "next";
import Analytics from "..components/";
import { useEffect } from "react";

const Home: NextPage = () => {
  useEffect(() => {
    window.location.href =
      "https://app.usefathom.com/share/fuivzexd/queerburners.org";
  }, []);

  return (
    <div>
      <h1>Loading Analytics...</h1>
    </div>
  );
};

export default Home;
