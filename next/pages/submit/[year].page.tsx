import type { NextPage } from "next";
import Presubmit from "../../components/Presubmit";

const SubmitYearPage: NextPage = () => {
  return (
    <Presubmit
      userData={userData}
      year={props.match.params.year}
      camp={new URLSearchParams(props.location.search).get("camp")}
    />
  );
};

export default SubmitYearPage;
