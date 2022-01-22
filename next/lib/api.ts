import axios from "axios";
import { api } from "../definitions";

export const fetchPostHtml = async (params: {
  postSlug: string;
}): Promise<string> => {
  const postHtml = await axios
    .get(`${api}/posts/${params.postSlug}`)
    .then(({ data }) => data.post)
    .catch(() => "<h1>404 Not Found</h1>");

  return postHtml;
};

export const getAllPostSlugs = async (): Promise<string[]> => {
  const paths = await axios
    .get<{ path: string }[]>(`${api}/posts`)
    .then(({ data }) => data.map(({ path }) => path));

  return paths;
};
