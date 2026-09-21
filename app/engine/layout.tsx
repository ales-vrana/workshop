import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Workshop Engine",
  description: "Interní cockpit pro měření workshopové landing page.",
  robots: { index: false, follow: false },
};

export default function EngineLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#F4F6FB] text-dark">
      {children}
    </div>
  );
}
