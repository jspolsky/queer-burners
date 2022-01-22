import type { NextPage } from "next";
import ViewPost from "../components/ViewPost";

const Home: NextPage = () => {
  return <ViewPost userData={userData} post="greetersStation" />;
};

export default Home;
