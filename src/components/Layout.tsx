export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-gray-900 text-gray-50">
      {children}
    </div>
  );
}
