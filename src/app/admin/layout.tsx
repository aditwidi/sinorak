export const metadata = {
    title: "Halaman Admin - SINORAK",
    description: "Halaman Home Admin",
  };
  
  export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
      <div className="flex bg-gray-50 min-h-screen">
        {children}
      </div>
    );
  }
  