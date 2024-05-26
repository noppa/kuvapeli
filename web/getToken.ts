let token: undefined | string = undefined;

export default function getToken(): string | undefined {
  if (token) {
    return token;
  }
  const searchParams = new URLSearchParams(window.location.search);
  const tokenFromQuery = searchParams.get("token");
  if (tokenFromQuery) {
    localStorage.setItem("token", tokenFromQuery);
    const url = new URL(window.location.href);
    searchParams.delete("token");
    url.search = searchParams.toString();
    location.href = url.toString();
  }
  const tokenFromLs = localStorage.getItem("token");
  if (tokenFromLs) {
    token = tokenFromLs;
    return token;
  }
}
