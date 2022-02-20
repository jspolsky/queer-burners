import type { NextPage } from "next";
import { useContext } from "react";
import Presubmit from "../components/Presubmit";
import UserContext from "../components/UserContext";

const SubmitPage: NextPage = () => {
  const { userData } = useContext(UserContext);
  return <Presubmit userData={userData} year={null} camp={null} />;
};

export default SubmitPage;
