import DashboardLoginClient from "./DashboardLoginClient";

export default function DashboardLoginPage({ searchParams }) {
  const nextPath = typeof searchParams?.next === "string" && searchParams.next.trim() ? searchParams.next : "/dashboard";

  return <DashboardLoginClient nextPath={nextPath} />;
}
