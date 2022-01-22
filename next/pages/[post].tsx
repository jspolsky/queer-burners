import type { NextPage } from "next";
import ViewPost from "../components/ViewPost";

const PostPage: NextPage = () => {
  return <ViewPost userData={userData} post={props.match.params.post} />;
};

export default PostPage;
