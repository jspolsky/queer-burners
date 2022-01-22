import type { NextPage } from "next";
import EditPost from "../../components/EditPost";

const EditPostPage: NextPage = () => {
  return <EditPost userData={userData} post={props.match.params.post} />;
};

export default EditPostPage;
