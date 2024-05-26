let token: undefined | string = undefined;

export default function getToken(): string | undefined {
  if (token) {
    return token;
  }
  const tokenFromQuery = new URLSearchParams(window.location.search).get(
    "token",
  );
  if (tokenFromQuery) {
    localStorage.setItem("token", tokenFromQuery);
  }
  const tokenFromLs = localStorage.getItem("token");
  if (tokenFromLs) {
    token = tokenFromLs;
    return token;
  }
}
