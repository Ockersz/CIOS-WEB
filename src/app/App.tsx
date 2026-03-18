import { BrowserRouter, Routes, Route } from "react-router";
import { Navigation } from "./components/Navigation";
import { Footer } from "./components/Footer";
import { ScrollToTopButton } from "./components/ScrollToTop";
import { ScrollToTopOnMount } from "./components/ScrollToTopOnMount";
import { Home } from "./components/pages/Home";
import { About } from "./components/pages/About";
import { Services } from "./components/pages/Services";
import { ServiceDetail } from "./components/pages/ServiceDetail";
import { Blog } from "./components/pages/Blog";
import { Contact } from "./components/pages/Contact";
import { JoinTeam } from "./components/pages/JoinTeam";
import { GetQuote } from "./components/pages/GetQuote";

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTopOnMount />
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route
              path="/services/:serviceId"
              element={<ServiceDetail />}
            />
            <Route path="/blog" element={<Blog />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/join-team" element={<JoinTeam />} />
            <Route path="/get-quote" element={<GetQuote />} />
          </Routes>
        </main>
        <Footer />
        <ScrollToTopButton />
      </div>
    </BrowserRouter>
  );
}