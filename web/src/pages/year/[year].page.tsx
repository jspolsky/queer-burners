import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import { DirectoryBody } from "../../components/DirectoryBody";
import UserContext from "../../components/UserContext";
import { defaultYear } from "../../definitions";
import { CampData, fetchAllCamps } from "../../lib/api";

type ParsedUrlQuery = {
  year: string;
};

type DirectoryByPageProps = {
  year: number;
  publicCamps: CampData[];
};

export const getStaticPaths: GetStaticPaths<ParsedUrlQuery> = async () => {
  return {
    fallback: "blocking",
    paths: [2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019].map((year) => ({
      params: {
        year: year.toString(),
      },
    })),
  };
};
export const getStaticProps: GetStaticProps<
  DirectoryByPageProps,
  ParsedUrlQuery
> = async ({ params }) => {
  const { year: stringifiedYear } = params ?? {};
  if (stringifiedYear) {
    const year = parseInt(stringifiedYear, 10);

    return {
      revalidate: 10,
      props: {
        year,
        publicCamps: await fetchAllCamps({ year }),
      },
    };
  }
  throw new Error("");
};

const DirectoryByYearPage: NextPage<DirectoryByPageProps> = ({
  year,
  publicCamps,
}) => {
  const { userData } = useContext(UserContext);

  const [authenticatedCamps, setAuthenticatedCamps] = useState<CampData[]>([]);

  useEffect(() => {
    if (userData) {
      void fetchAllCamps({
        auth: { username: userData.idToken, password: "" },
        year,
      }).then((camps) => setAuthenticatedCamps(camps));
    }
  }, [userData, year]);

  return (
    <DirectoryBody
      year={year}
      camps={userData.isLoggedOn ? authenticatedCamps : publicCamps}
    />
  );
};

export default DirectoryByYearPage;
