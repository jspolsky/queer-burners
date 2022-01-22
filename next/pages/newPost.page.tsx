import type { NextPage } from "next";
import EditPost from "../components/EditPost";

const NewPostPage: NextPage = () => {
  return <EditPost userData={userData} post={null} />;
};

export default NewPostPage;
