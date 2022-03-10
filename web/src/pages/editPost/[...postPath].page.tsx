import type { NextPage } from "next";
import { useRouter } from "next/router";
import EditPost from "../../components/EditPost";

const EditPostPage: NextPage = () => {
  const { query } = useRouter();

  const postSlug =
    query.postPath && Array.isArray(query.postPath)
      ? query.postPath.join("/")
      : undefined;

  return <EditPost post={postSlug} />;
};

export default EditPostPage;
