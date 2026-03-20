import { BrowserRouter, Routes, Route, useLocation } from "react-router";
import { lazy, Suspense, useEffect } from "react";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { ScrollToTopButton } from "./components/ScrollToTop";
import { ScrollToTopOnMount } from "./components/ScrollToTopOnMount";
import { Home } from "./components/pages/Home";
import { Seo } from "./components/Seo";
import { useSiteSettings } from "./lib/api";
import { buildPageTitle } from "./lib/seo";
import { applyThemeColors } from "./lib/theme";

const About = lazy(() => import("./components/pages/About").then((module) => ({ default: module.About })));
const Services = lazy(() => import("./components/pages/Services").then((module) => ({ default: module.Services })));
const ServiceDetail = lazy(() =>
  import("./components/pages/ServiceDetail").then((module) => ({ default: module.ServiceDetail })),
);
const Blog = lazy(() => import("./components/pages/Blog").then((module) => ({ default: module.Blog })));
const Contact = lazy(() => import("./components/pages/Contact").then((module) => ({ default: module.Contact })));
const JoinTeam = lazy(() => import("./components/pages/JoinTeam").then((module) => ({ default: module.JoinTeam })));
const GetQuote = lazy(() => import("./components/pages/GetQuote").then((module) => ({ default: module.GetQuote })));
const Admin = lazy(() => import("./components/pages/Admin").then((module) => ({ default: module.Admin })));

function RouteFallback({ isAdmin }: { isAdmin: boolean }) {
  return (
    <div
      className={`flex items-center justify-center px-6 text-center text-[var(--brand-text-muted)] ${
        isAdmin ? "min-h-screen bg-[var(--brand-canvas)]" : "min-h-[40vh]"
      }`}
    >
      Loading page...
    </div>
  );
}

function AppShell() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    applyThemeColors(settings?.styles);
  }, [settings?.styles]);

  return (
    <>
      <ScrollToTopOnMount />
      {isAdmin ? (
        <Seo
          title={buildPageTitle("Admin", settings)}
          description="Website administration portal."
          path={location.pathname}
          noIndex
        />
      ) : null}
      <div className="min-h-screen flex flex-col">
        {!isAdmin ? <Navigation /> : null}
        <main className="flex-1">
          <Suspense fallback={<RouteFallback isAdmin={isAdmin} />}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/services" element={<Services />} />
              <Route path="/services/:serviceId" element={<ServiceDetail />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/join-team" element={<JoinTeam />} />
              <Route path="/get-quote" element={<GetQuote />} />
              <Route path="/admin" element={<Admin />} />
            </Routes>
          </Suspense>
        </main>
        {!isAdmin ? <Footer /> : null}
        {!isAdmin ? <ScrollToTopButton /> : null}
      </div>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
