import type { NextPage } from "next";
import EditPost from "../components/EditPost";

const NewPostPage: NextPage = () => {
  return <EditPost post={null} />;
};

export default NewPostPage;
