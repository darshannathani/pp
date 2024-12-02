import { SideBarComponent } from "@/components/shared/sideBar/SideBar";

export const metadata = {
  title: "Uplift | Dashboard",
};

export default function RootLayout({ children }) {
  return (
    <section className="flex gap-2">
      <SideBarComponent className="my-3" />
      {children}
    </section>
  );
}
