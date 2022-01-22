import type { NextPage } from "next";
import Presubmit from "../components/Presubmit";

const SubmitPage: NextPage = () => {
  return <Presubmit userData={userData} year={null} camp={null} />;
};

export default SubmitPage;
