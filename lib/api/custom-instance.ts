import type { AxiosRequestConfig } from 'axios';
import Axios from 'axios';
import { axiosBaseInstance } from '../../src/lib/api/axios';

function normalizeUrl(targetUrl?: string): string | undefined {
  if (!targetUrl) {
    return targetUrl;
  }

  const baseURL = axiosBaseInstance.defaults.baseURL;
  if (!baseURL) {
    return targetUrl;
  }

  let basePath = '';
  try {
    const parsedBase = new URL(baseURL);
    basePath = parsedBase.pathname.replace(/\/$/, '');
  } catch {
    basePath = '';
  }

  const stripBasePath = (path: string) => {
    if (
      basePath &&
      (path === basePath || path.startsWith(`${basePath}/`))
    ) {
      const stripped = path.slice(basePath.length);
      return stripped.startsWith('/') ? stripped : `/${stripped}`;
    }
    return path;
  };

  if (targetUrl.startsWith('http')) {
    try {
      const parsed = new URL(targetUrl);
      let pathname = parsed.pathname || '/';
      pathname = stripBasePath(pathname);
      if (!pathname.startsWith('/')) {
        pathname = `/${pathname}`;
      }
      return `${pathname}${parsed.search}${parsed.hash}`;
    } catch {
      return targetUrl;
    }
  }

  let relativePath = stripBasePath(targetUrl);
  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`;
  }
  return relativePath;
}

// Custom instance for Orval
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();

  const resolvedUrl = normalizeUrl(config.url);

  console.log('[API Request]', {
    original: config.url,
    final: resolvedUrl,
    baseURL: axiosBaseInstance.defaults.baseURL,
  });

  const promise = axiosBaseInstance({
    ...config,
    url: resolvedUrl,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-ignore
  promise.cancel = () => {
    source.cancel('Query was cancelled');
  };

  return promise;
};

export default customInstance;
