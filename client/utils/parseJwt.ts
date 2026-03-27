export const parseJwt = (token: string) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    return null;
  }
};
