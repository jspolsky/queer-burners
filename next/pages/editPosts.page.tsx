import type { NextPage } from "next";
import EditPosts from "../components/EditPosts";

const EditPostsPage: NextPage = () => {
  return <EditPosts userData={userData} />;
};

export default EditPostsPage;
