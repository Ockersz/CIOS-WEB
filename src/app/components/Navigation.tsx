import { Link, useLocation } from "react-router";
import { Menu, X, MapPin, Clock, Phone, Mail, Linkedin } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import ciosLogo from "../../imports/cioslogo.svg";
import { useSiteSettings } from "../lib/api";

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();
  const { data: settings } = useSiteSettings();
  const business = settings?.business;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/about", label: "About" },
    { path: "/services", label: "Services" },
    { path: "/blog", label: "Blog" },
    { path: "/contact", label: "Contact" },
    { path: "/join-team", label: "Join Our Team" },
  ];

  const isActive = (path: string) => location.pathname === path;
  const address = business?.addressLines?.slice(0, 2).join(", ");
  const hours = business?.hours?.[0];

  return (
    <nav className="sticky top-0 z-50">
      <AnimatePresence>
        {!isScrolled && (
          <motion.div
            initial={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="bg-[#3D1810] text-white text-sm py-2">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-6">
                    {address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{address}</span>
                      </div>
                    )}
                    {hours && (
                      <div className="hidden sm:flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        <span>{hours}</span>
                      </div>
                    )}
                  </div>
                  {business?.linkedinUrl && (
                    <a
                      href={business.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-[#F4C430] transition-colors"
                    >
                      <Linkedin className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-white shadow-sm py-4">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                  <Link to="/" className="flex items-center">
                    <img src={ciosLogo} alt="CIOS" className="w-24 h-24 object-contain" />
                  </Link>

                  <div className="hidden lg:flex items-center gap-8">
                    {business?.phoneDisplay && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8F5E9] flex items-center justify-center">
                          <Phone className="w-5 h-5 text-[#4CAF50]" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Call Us</div>
                          <a
                            href={business.phoneHref}
                            className="text-sm font-medium text-gray-900 hover:text-[#F4C430]"
                          >
                            {business.phoneDisplay}
                          </a>
                        </div>
                      </div>
                    )}

                    {business?.email && (
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E3F2FD] flex items-center justify-center">
                          <Mail className="w-5 h-5 text-[#2196F3]" />
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Email Us</div>
                          <a
                            href={`mailto:${business.email}`}
                            className="text-sm font-medium text-gray-900 hover:text-[#F4C430]"
                          >
                            {business.email}
                          </a>
                        </div>
                      </div>
                    )}

                    <Link
                      to="/get-quote"
                      className="inline-flex items-center justify-center px-6 py-3 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-colors font-medium"
                    >
                      Get A Quote
                    </Link>
                  </div>

                  <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2">
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-[#F4C430] hidden lg:block rounded-[10px] mx-[200px] my-[0px]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-center items-center space-x-12 py-4">
                  {navLinks.map((link) => (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`transition-colors font-medium ${
                        isActive(link.path)
                          ? "text-black"
                          : "text-[#3D1810]/80 hover:text-black"
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

      {isScrolled && (
        <motion.div
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="bg-white shadow-lg"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <Link to="/" className="flex items-center">
                <img src={ciosLogo} alt="CIOS" className="w-16 h-16 object-contain" />
              </Link>

              <div className="hidden lg:flex items-center space-x-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`transition-colors font-medium ${
                      isActive(link.path)
                        ? "text-[#F4C430] border-b-2 border-[#F4C430]"
                        : "text-gray-700 hover:text-[#F4C430]"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-2">
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:hidden bg-white border-t border-gray-200"
        >
          <div className="px-4 py-4 space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className="block text-gray-700 hover:text-[#F4C430] transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </nav>
  );
}
