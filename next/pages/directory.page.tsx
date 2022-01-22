import type { NextPage } from "next";
import DirectoryBody from "../components/DirectoryBody";

const DirectoryPage: NextPage = () => {
  return <DirectoryBody {...props} year="" userData={userData} />;
};

export default DirectoryPage;
