import Link from "next/link";

const navItems = [
  { href: "/", label: "ภาพรวม" },
  { href: "/people", label: "ผู้ใช้บริการ" },
  { href: "/services", label: "ความต้องการบริการ" },
  { href: "/ai", label: "ถาม AI" },
  { href: "/about-data", label: "ข้อมูลจำลอง" },
];

export function AppSidebar() {
  return (
    <aside className="hidden min-h-screen w-64 border-r border-slate-200 bg-white px-4 py-5 lg:block">
      <Link className="flex items-center gap-3" href="/">
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-[var(--ci-blue)] text-sm font-bold text-white">
          CK
        </span>
        <span>
          <span className="block text-base font-semibold text-slate-950">CareKey</span>
          <span className="block text-xs font-medium text-slate-500">Prototype</span>
        </span>
      </Link>

      <nav className="mt-8 space-y-1">
        {navItems.map((item) => (
          <Link
            className="block rounded-md px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-950"
            href={item.href}
            key={item.href}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export function MobileNav() {
  return (
    <nav className="sticky top-0 z-10 flex gap-2 overflow-x-auto border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
      {navItems.map((item) => (
        <Link
          className="shrink-0 rounded-md border border-slate-200 px-3 py-2 text-sm font-medium text-slate-700"
          href={item.href}
          key={item.href}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
