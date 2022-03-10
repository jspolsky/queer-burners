import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import Presubmit from "../../components/Presubmit";
import UserContext from "../../components/UserContext";

const SubmitYearPage: NextPage = () => {
  const { query } = useRouter();
  const { userData } = useContext(UserContext);

  return <Presubmit userData={userData} year={query.year} camp={query.camp} />;
};

export default SubmitYearPage;
