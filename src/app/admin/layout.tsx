export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="admin-shell font-sans">{children}</div>;
}
