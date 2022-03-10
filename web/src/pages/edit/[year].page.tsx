import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useContext } from "react";
import SubmitBody from "../../components/SubmitBody";
import UserContext from "../../components/UserContext";

const SubmitBodyPage: NextPage = () => {
  const { query } = useRouter();
  const { userData } = useContext(UserContext);
  return <SubmitBody userData={userData} year={query.year} camp={query.camp} />;
};

export default SubmitBodyPage;
