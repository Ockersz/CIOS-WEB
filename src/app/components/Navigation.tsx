import { Link, useLocation } from "react-router";
import { Menu, X, MapPin, Clock, Phone, Mail, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ciosLogo from "../../imports/cioslogo.svg";
import { useCmsPage, useSiteSettings } from "../lib/api";

const NAV_SCROLL_SHOW_OFFSET = 140;
const NAV_SCROLL_HIDE_OFFSET = 80;

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const { data: blogPage } = useCmsPage("blog");
  const business = settings?.business;
  const isBlogVisible = blogPage?.content?.isVisible !== false;

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      setIsScrolled((current) => {
        if (current) {
          return scrollY > NAV_SCROLL_HIDE_OFFSET;
        }

        return scrollY > NAV_SCROLL_SHOW_OFFSET;
      });
    };

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/contact", label: "Contact" },
    { path: "/join-team", label: "Join Our Team" },
  ];
  if (isBlogVisible) {
    navLinks.splice(3, 0, { path: "/blog", label: "Blog" });
  }

  const isActive = (path: string) => location.pathname === path;
  const address = business?.addressLines?.slice(0, 2).join(", ");
  const hours = business?.hours?.[0];

  return (
    <nav className="sticky top-0 z-50">
      <motion.div
        animate={{
          boxShadow: isScrolled ? "0 10px 30px rgba(0, 0, 0, 0.12)" : "0 1px 3px rgba(0, 0, 0, 0.06)",
        }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="bg-white"
      >
        <AnimatePresence initial={false}>
          {!isScrolled && (
            <motion.div
              key="nav-top-strip"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="overflow-hidden bg-[var(--brand-brown)] text-white"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center py-2 text-sm">
                  <div className="flex items-center gap-6 min-w-0">
                    {address && (
                      <div className="flex items-center gap-2 min-w-0">
                        <MapPin className="w-4 h-4 shrink-0" />
                        <span className="truncate">{address}</span>
                      </div>
                    )}
                    {hours && (
                      <div className="hidden sm:flex items-center gap-2 min-w-0">
                        <Clock className="w-4 h-4 shrink-0" />
                        <span className="truncate">{hours}</span>
                      </div>
                    )}
                  </div>
                  {business?.linkedinUrl && (
                    <a
                      href={business.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[var(--brand-accent)] transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          animate={{
            paddingTop: isScrolled ? 12 : 16,
            paddingBottom: isScrolled ? 12 : 16,
          }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="border-b border-gray-100"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center gap-6">
              <Link to="/" className="flex items-center shrink-0">
                <motion.img
                  src={ciosLogo}
                  alt="CIOS"
                  animate={{
                    width: isScrolled ? 64 : 96,
                    height: isScrolled ? 64 : 96,
                  }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="object-contain"
                />
              </Link>

              <div className="hidden lg:flex items-center gap-6 ml-auto">
                {isScrolled &&
                  navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`transition-colors font-medium ${
                        isActive(link.path)
                          ? "text-[var(--brand-accent)]"
                          : "text-gray-700 hover:text-[var(--brand-accent)]"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                <AnimatePresence initial={false}>
                  {!isScrolled && (
                    <motion.div
                      key="nav-contact-meta"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="flex items-center gap-8 overflow-hidden"
                    >
                      {business?.phoneDisplay && (
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                            <Phone className="w-5 h-5 text-[#4CAF50]" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Call Us</div>
                            <a
                              href={business.phoneHref}
                              className="text-sm font-medium text-gray-900 hover:text-[var(--brand-accent)]"
                            >
                              {business.phoneDisplay}
                            </a>
                          </div>
                        </div>
                      )}

                      {business?.email && (
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                            <Mail className="w-5 h-5 text-[#2196F3]" />
                          </div>
                          <div>
                            <div className="text-xs text-gray-500">Email Us</div>
                            <a
                              href={`mailto:${business.email}`}
                              className="text-sm font-medium text-gray-900 hover:text-[var(--brand-accent)]"
                            >
                              {business.email}
                            </a>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Link
                  to="/get-quote"
                  className="inline-flex items-center justify-center px-6 py-3 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-colors font-medium shrink-0"
                >
                  Get A Quote
                </Link>
              </div>

              <button type="button" onClick={() => setIsOpen((current) => !current)} className="lg:hidden p-2">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <AnimatePresence initial={false}>
        {!isScrolled && (
          <motion.div
            key="nav-link-bar"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="hidden lg:block overflow-hidden"
          >
            <div className="bg-[var(--brand-accent)] rounded-[10px] mx-[200px]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center space-x-12 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`transition-colors font-medium ${
                        isActive(link.path) ? "text-black" : "text-[var(--brand-brown-muted)] hover:text-black"
                      }`}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="lg:hidden overflow-hidden bg-white border-t border-gray-200"
          >
            <div className="px-4 py-4 space-y-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                className="block text-gray-700 hover:text-[var(--brand-accent)] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/get-quote"
                onClick={() => setIsOpen(false)}
                className="inline-flex items-center justify-center px-6 py-3 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-colors font-medium"
              >
                Get A Quote
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
