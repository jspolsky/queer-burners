import type { NextPage } from "next";
import { useRouter } from "next/router";
import EditPost from "../../components/EditPost";

type ParsedUrlQuery = {
  postPath: string[];
};

const EditPostPage: NextPage = () => {
  const { query } = useRouter();

  const postSlug = (query as ParsedUrlQuery).postPath.join("/");

  return <EditPost post={postSlug} />;
};

export default EditPostPage;
