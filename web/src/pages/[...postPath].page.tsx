import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import UserContext from "../components/UserContext";
import ViewPost from "../components/ViewPost";
import { getAllPostSlugs, fetchPostHtml } from "../lib/api";

type ParsedUrlQuery = {
  postPath: string[];
};

type PostPageProps = {
  postSlug: string;
  postHtml: string;
};

export const getStaticPaths: GetStaticPaths<ParsedUrlQuery> = async () => {
  return {
    fallback: "blocking",
    paths: (await getAllPostSlugs()).map((path) => ({
      params: {
        postPath: path.split("/"),
      },
    })),
  };
};

export const getStaticProps: GetStaticProps<
  PostPageProps,
  ParsedUrlQuery
> = async ({ params }) => {
  const { postPath } = params || {};

  if (postPath) {
    const postSlug = postPath.join("/");
    return {
      revalidate: 10,
      props: {
        postSlug,
        postHtml: await fetchPostHtml({ postSlug }),
      },
    };
  }
  throw new Error("");
};

const PostPage: NextPage<PostPageProps> = ({
  postSlug,
  postHtml: staticPostHtml,
}) => {
  const { userData } = useContext(UserContext);

  const [fetchedPostHtml, setFetchedPostHtml] = useState<string>();

  const userIsAdmin = userData && userData.isAdmin;

  useEffect(() => {
    if (userIsAdmin) {
      void fetchPostHtml({ postSlug }).then(setFetchedPostHtml);
    }
  }, [postSlug, userIsAdmin]);

  const postHtml = userIsAdmin ? fetchedPostHtml : staticPostHtml;

  return postHtml ? <ViewPost postSlug={postSlug} postHtml={postHtml} /> : null;
};

export default PostPage;
