import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import EditPost from "../../components/EditPost";
import UserContext from "../../components/UserContext";

const EditPostPage: NextPage = () => {
  const { query } = useRouter();

  return <EditPost post={query.post} />;
};

export default EditPostPage;
