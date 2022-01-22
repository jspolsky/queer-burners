import type { NextPage } from "next";
import SubmitBody from "../../components/SubmitBody";

const Home: NextPage = () => {
  return (
    <SubmitBody
      userData={userData}
      year={props.match.params.year}
      camp={new URLSearchParams(props.location.search).get("camp")}
    />
  );
};

export default Home;
