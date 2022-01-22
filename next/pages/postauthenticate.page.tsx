import type { NextPage } from "next";
import { PostAuthenticate } from "../components/Authenticate";

const PostAuthenticatePage: NextPage = () => {
  return (
    <PostAuthenticate
      {...props}
      OnUserDataChange={(newUserData) => {
        setUserData(newUserData);
      }}
    />
  );
};

export default PostAuthenticatePage;
