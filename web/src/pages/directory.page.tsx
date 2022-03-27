import type { GetStaticProps, NextPage } from "next";
import { useContext, useEffect, useState } from "react";
import { DirectoryBody } from "../components/DirectoryBody";
import UserContext from "../components/UserContext";
import { defaultYear } from "../definitions";
import { CampData, fetchAllCamps } from "../lib/api";

type DirectoryPageProps = {
  publicCamps: CampData[];
};

export const getStaticProps: GetStaticProps<DirectoryPageProps> = async () => {
  return {
    revalidate: 10,
    props: {
      publicCamps: await fetchAllCamps({ year: defaultYear }),
    },
  };
};

const DirectoryPage: NextPage<DirectoryPageProps> = ({ publicCamps }) => {
  const { userData } = useContext(UserContext);

  const [authenticatedCamps, setAuthenticatedCamps] = useState<CampData[]>([]);

  useEffect(() => {
    if (userData) {
      void fetchAllCamps({
        auth: { username: userData.idToken, password: "" },
        year: defaultYear,
      }).then((camps) => setAuthenticatedCamps(camps));
    }
  }, [userData]);

  return (
    <DirectoryBody
      camps={userData.isLoggedOn ? authenticatedCamps : publicCamps}
      year={defaultYear}
    />
  );
};

export default DirectoryPage;
