import type { NextPage } from "next";
import { useEffect } from "react";

const AnalyticsPage: NextPage = () => {
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

export default AnalyticsPage;
