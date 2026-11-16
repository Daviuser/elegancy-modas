import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <StoreHeader />
      <main className="flex-1">{children}</main>
      <StoreFooter />
    </div>
  );
}
