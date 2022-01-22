import type { GetStaticProps, NextPage } from "next";
import ViewPost from "../components/ViewPost";
import { fetchPostHtml } from "../lib/api";

type HomePageProps = {
  postSlug: string;
  postHtml: string;
};

export const getStaticProps: GetStaticProps<HomePageProps> = async () => {
  const postSlug = "greetersStation";

  return {
    props: {
      postSlug,
      postHtml: await fetchPostHtml({ postSlug }),
    },
  };
};

const Home: NextPage<HomePageProps> = ({ postSlug, postHtml }) => {
  return <ViewPost postSlug={postSlug} postHtml={postHtml} />;
};

export default Home;
