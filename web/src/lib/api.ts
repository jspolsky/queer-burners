import axios, { AxiosBasicCredentials, AxiosRequestConfig } from "axios";
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

export const fetchPostHtmlNoError = async (params: {
  postSlug: string;
}): Promise<string> => {
  const postHtml = await axios
    .get(`${api}/posts/${params.postSlug}`)
    .then(({ data }) => data.post)
    .catch(() => "");

  return postHtml;
};

export const getAllPostSlugs = async (): Promise<string[]> => {
  const paths = await axios
    .get<{ path: string }[]>(`${api}/posts`)
    .then(({ data }) => data.map(({ path }) => path));

  return paths;
};

export type CampData = {
  campFee: boolean;
  joinOpen: boolean;
  facebook: string;
  location: { string: string; frontage: string; intersection: string };
  fullSizeImage: string;
  identifies: string;
  virginsWelcome: boolean;
  created: string;
  email: string;
  offerShowers: boolean;
  url: string;
  name: string;
  joinMessage: string;
  twitter: string;
  offerWater: boolean;
  instagram: string;
  about: string;
  offerMeals: boolean;
  year: number;
  thumbnail: string;
  joinUrl: string;
  hashEmail: string;
  contact?: {
    email: string;
  };
};

export const fetchAllCamps = async (params: {
  auth?: AxiosBasicCredentials;
  year: number;
}): Promise<CampData[]> => {
  const { year, auth } = params;
  const camps = await axios
    .get(`${api}/camps/${year}`, { auth })
    .then(({ data }) => data);

  return camps;
};
