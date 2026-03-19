import { Link } from "react-router";
import { Facebook, Instagram, Linkedin, Mail, Phone, MapPin } from "lucide-react";
import ciosLogoDark from "../../imports/ciosdark.svg";
import { useSiteSettings } from "../lib/api";

export function Footer() {
  const { data: settings } = useSiteSettings();
  const business = settings?.business;

  return (
    <footer className="bg-[#1a1a1a] text-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <img src={ciosLogoDark} alt="CIOS Logo" className="h-16 w-auto mb-4" />
            <p className="text-gray-400 text-sm mb-4">
              {business?.shortDescription || "Professional cleaning services for every space."}
            </p>
            <div className="flex space-x-4">
              <a href={business?.linkedinUrl || "#"} className="text-gray-400 hover:text-[#F4C430] transition-colors">
                <Linkedin size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#F4C430] transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-[#F4C430] transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/about" className="text-gray-400 hover:text-[#F4C430] transition-colors">About Us</Link></li>
              <li><Link to="/services" className="text-gray-400 hover:text-[#F4C430] transition-colors">Our Services</Link></li>
              <li><Link to="/blog" className="text-gray-400 hover:text-[#F4C430] transition-colors">Blog</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-[#F4C430] transition-colors">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Services</h3>
            <ul className="space-y-2 text-sm">
              {(settings?.footer?.services || []).map((service) => (
                <li key={service} className="text-gray-400">{service}</li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4">Contact Info</h3>
            <ul className="space-y-3 text-sm">
              {business?.addressLines?.length ? (
                <li className="flex items-start">
                  <MapPin size={16} className="mr-2 mt-1 flex-shrink-0 text-[#F4C430]" />
                  <span className="text-gray-400">{business.addressLines.join(", ")}</span>
                </li>
              ) : null}
              {business?.phoneDisplay ? (
                <li className="flex items-center">
                  <Phone size={16} className="mr-2 flex-shrink-0 text-[#F4C430]" />
                  <span className="text-gray-400">{business.phoneDisplay}</span>
                </li>
              ) : null}
              {business?.email ? (
                <li className="flex items-center">
                  <Mail size={16} className="mr-2 flex-shrink-0 text-[#F4C430]" />
                  <span className="text-gray-400">{business.email}</span>
                </li>
              ) : null}
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2026 {business?.copyrightName || "CIOS Cleaning & Detailing"}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
