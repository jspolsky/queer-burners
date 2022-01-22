import type { NextPage } from "next";
import DirectoryBody from "../../components/DirectoryBody";

const DirectoryByYearPage: NextPage = () => {
  return (
    <DirectoryBody
      {...props}
      year={props.match.params.year}
      search={new URLSearchParams(props.location.search).get("s")}
      userData={userData}
    />
  );
};

export default DirectoryByYearPage;
