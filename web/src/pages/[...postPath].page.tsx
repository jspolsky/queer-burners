import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
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

const PostPage: NextPage<PostPageProps> = ({ postSlug, postHtml }) => {
  return <ViewPost postSlug={postSlug} postHtml={postHtml} />;
};

export default PostPage;
