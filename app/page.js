import Link from "next/link";

export default function Home() {
  return (
    <div className="card">
      <h1>Grepolis Pulse Panel</h1>
      <p>
        <small>Panel de administración para ingestar datos de mundos.</small>
      </p>
      <p>
        <Link href="/admin">Ir al panel</Link>
      </p>
    </div>
  );
}
