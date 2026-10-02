export const dynamic = "force-dynamic";

export default function TechLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto min-h-screen max-w-md bg-gray-50 px-4 pt-4 pb-16">
      <div className="mb-4 text-center text-base font-bold tracking-tight">
        305 <span className="text-brand">SKY</span>
      </div>
      {children}
    </div>
  );
}
