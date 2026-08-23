import {
  BACKEND_HOST_KEY,
  BACKEND_HOST_PROTOCOL_KEY,
  DEFAULT_BACKEND_HOST,
  DEFAULT_BACKEND_HOST_PROTOCOL,
} from "../constants";
import { getData } from "./aStorage";

export async function getHost() {
  return ((await getData(BACKEND_HOST_KEY)) || DEFAULT_BACKEND_HOST) as string;
}

export async function getApiBaseURL() {
  const host = await getHost();
  const protocol =
    (await getData(BACKEND_HOST_PROTOCOL_KEY)) || DEFAULT_BACKEND_HOST_PROTOCOL;
  return `${protocol}://${host}/api`;
}

export async function getSocketBaseURL() {
  const host = await getHost();
  const protocol =
    (await getData(BACKEND_HOST_PROTOCOL_KEY)) || DEFAULT_BACKEND_HOST_PROTOCOL;
  return `${protocol}://${host}/ws`;
}
