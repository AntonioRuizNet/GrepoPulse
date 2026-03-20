import LoginClient from "./LoginClient";

export default function AdminLoginPage({ searchParams }) {
  const nextPath = typeof searchParams?.next === "string" && searchParams.next.trim() ? searchParams.next : "/admin";

  return <LoginClient nextPath={nextPath} />;
}
