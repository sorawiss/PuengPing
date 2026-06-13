import Link from "next/link";

export function StatCard({
  label,
  value,
  detail,
  href,
}: {
  label: string;
  value: number | string;
  detail: string;
  href?: string;
}) {
  const content = (
    <div className="h-full rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300">
      <p className="text-sm font-medium text-slate-500">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-slate-950">{value}</p>
      <p className="mt-2 text-sm leading-5 text-slate-600">{detail}</p>
    </div>
  );

  if (!href) return content;
  return (
    <Link className="block focus:outline-none focus:ring-2 focus:ring-[var(--ci-blue)]" href={href}>
      {content}
    </Link>
  );
}
