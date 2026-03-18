import image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246 from 'figma:asset/8fea4c5ef9eb269dfb675b419c51c4d62a3cb246.png'
import image_94b666d9c50b2eedc24a1a945995ba83a4abfcff from "figma:asset/94b666d9c50b2eedc24a1a945995ba83a4abfcff.png";
import { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Building2,
  GraduationCap,
  HeartPulse,
  Truck,
  ShieldCheck,
  Trees,
  Home,
  Leaf,
  Recycle,
  Droplets,
  ChevronRight,
  CheckCircle,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import ciosLogo from "figma:asset/6372cb420fc0690c19c4c9f66ad33b20d184313c.png";

const services = [
  {
    id: "commercial",
    label: "Commercial & Industrial",
    icon: Building2,
    title: "Commercial & Industrial Cleaning",
    description:
      "We offer a comprehensive range of cleaning services tailored to meet both regular maintenance needs and specialized tasks like carpet and window cleaning. With years of experience, our team delivers reliable service that aligns with your requirements and budget, whether it's a one-time job or a recurring arrangement. Our eco-friendly cleaning solutions protect both your facility and the environment.",
    imageQuery:
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800",
    isEcoFriendly: true,
  },
  {
    id: "educational",
    label: "Educational",
    icon: GraduationCap,
    title: "Educational Cleaning",
    description:
      "For educational institutions, maintaining a clean and hygienic environment is crucial. Our school and university cleaning services are specially designed to foster a safe and healthy atmosphere for students, teachers, and staff. We use eco-friendly products safe for children.",
    imageQuery:
      "https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800",
    isEcoFriendly: true,
  },
  {
    id: "medical",
    label: "Medical Facility",
    icon: HeartPulse,
    title: "Medical Facility Services",
    description:
      "Specialized medical facility cleaning with strict adherence to healthcare standards and infection control protocols. Our trained staff ensures sterile environments using hospital-grade, environmentally conscious disinfectants.",
    imageQuery:
      "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800",
    isEcoFriendly: true,
  },
  {
    id: "transport",
    label: "Transport",
    icon: Truck,
    title: "Transport Cleaning",
    description:
      "Complete cleaning solutions for all types of transport vehicles including buses, trains, trams, and commercial fleets. Green cleaning methods ensure passenger safety while protecting the environment.",
    imageQuery:
      "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800",
    isEcoFriendly: true,
  },
  {
    id: "infection-control",
    label: "Infection Control",
    icon: ShieldCheck,
    title: "Infection Control Cleaning",
    description:
      "Advanced infection control and deep sanitization services. We use environmentally responsible disinfectants that are tough on germs but safe for people and the planet.",
    imageQuery:
      "https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800",
    isEcoFriendly: true,
  },
  {
    id: "landscaping",
    label: "Landscaping",
    icon: Trees,
    title: "Landscaping & Ground Maintenance",
    description:
      "Professional landscaping services that nurture nature. We employ sustainable practices that create stunning landscapes while respecting our environment.",
    imageQuery:
      "https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800",
    isEcoFriendly: true,
  },
  {
    id: "residential",
    label: "Residential & Car",
    icon: Home,
    title: "Residential & Car Cleaning",
    description:
      "Comprehensive residential cleaning and vehicle detailing services. We use eco-friendly products that are safe for your family, pets, and the environment.",
    imageQuery:
      "https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800",
    isEcoFriendly: true,
  },
];

export function ServiceSelector() {
  const [selectedService, setSelectedService] = useState(
    services[0],
  );

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      {/* Background Image - Same as Services Page */}
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1752097439317-daa5cf0b7dd1?w=1920"
          alt="Nature background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      {/* Decorative Green Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Logo and Green Initiative */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          {/* CIOS Logo */}
          <div className="flex justify-center mb-4 md:mb-6">
            <img
              src={image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246}
              alt="CIOS"
              className="w-16 h-16 md:w-24 md:h-24 object-contain"
            />
          </div>

          {/* Green Initiative Badge */}
          <div className="inline-flex items-center gap-2 bg-[#F4C430] text-black px-4 py-2 md:px-6 md:py-3 rounded-full font-semibold mb-3 md:mb-4">
            <Leaf className="w-4 h-4 md:w-5 md:h-5" />
            <span className="uppercase tracking-wide text-xs md:text-sm">
              Save Our Planet
            </span>
          </div>

          <h2 className="text-2xl md:text-4xl lg:text-5xl font-bold text-white mb-2 md:mb-3 px-2">
            <span className="text-[#F4C430]">
              CIOS GREEN CLEANING INITIATIVE
            </span>
          </h2>
          <p className="text-base md:text-xl lg:text-2xl text-emerald-100 uppercase tracking-wide mb-4 md:mb-8 px-2">
            Our Wide Area of Services
          </p>

          {/* Green Benefits Pills */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4 md:mt-8 px-2">
            {[
              { icon: Leaf, text: "Eco-Friendly Products" },
              { icon: Droplets, text: "Water Conservation" },
              { icon: Recycle, text: "Sustainable Practices" },
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 + index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm px-3 py-2 md:px-5 md:py-3 rounded-full flex items-center gap-2 border border-white/20"
              >
                <benefit.icon className="w-4 h-4 md:w-5 md:h-5 text-[#F4C430]" />
                <span className="text-white font-medium text-xs md:text-sm">
                  {benefit.text}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Service Tabs with Green Accents */}
        <div className="mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden border-2 md:border-4 border-[#F4C430]">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7">
              {services.map((service) => {
                const Icon = service.icon;
                const isSelected =
                  selectedService.id === service.id;
                return (
                  <motion.button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`flex flex-col items-center justify-center gap-2 md:gap-3 p-3 md:p-6 transition-all border-r border-b lg:border-b-0 last:border-r-0 relative ${
                      isSelected
                        ? "bg-gradient-to-br from-emerald-500 to-emerald-700 text-white"
                        : "bg-white text-gray-700 hover:bg-emerald-50"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {isSelected && (
                      <motion.div
                        layoutId="selectedTab"
                        className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-emerald-700"
                        transition={{
                          type: "spring",
                          duration: 0.5,
                        }}
                      />
                    )}
                    <div className="relative z-10 flex flex-col items-center gap-1 md:gap-3">
                      <Icon
                        className={`w-6 h-6 md:w-8 md:h-8 ${isSelected ? "text-white" : ""}`}
                      />
                      <span
                        className={`text-[10px] md:text-sm font-medium text-center leading-tight ${isSelected ? "text-white" : ""}`}
                      >
                        {service.label}
                      </span>
                      {service.isEcoFriendly && (
                        <Leaf
                          className={`w-3 h-3 md:w-4 md:h-4 ${isSelected ? "text-[#F4C430]" : "text-emerald-600"}`}
                        />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Service Display Area with Enhanced Green Theme */}
        <motion.div
          key={selectedService.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center"
        >
          {/* Image Section */}
          <div className="relative">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 md:border-4 border-[#F4C430]">
              <ImageWithFallback
                src={selectedService.imageQuery}
                alt={selectedService.title}
                className="w-full h-[250px] md:h-[400px] lg:h-[500px] object-cover"
              />
              {/* Eco Badge Overlay */}
              <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-1.5 md:gap-2 shadow-xl">
                <Leaf className="w-4 h-4 md:w-5 md:h-5" />
                <span className="font-semibold text-xs md:text-sm">
                  ECO-FRIENDLY
                </span>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="text-white">
            <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-3 md:mb-4">
              {selectedService.title}
            </h3>
            <p className="text-gray-100 text-sm md:text-lg leading-relaxed mb-4 md:mb-6">
              {selectedService.description}
            </p>

            {/* Green Cleaning Promise Box */}
            <div className="bg-gradient-to-br from-[#F4C430]/20 to-emerald-500/20 border-2 border-[#F4C430] rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[#F4C430] rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 md:w-6 md:h-6 text-black" />
                </div>
                <h4 className="text-lg md:text-xl font-bold text-[#F4C430]">
                  Our Green Promise
                </h4>
              </div>
              <div className="space-y-2 md:space-y-3">
                {[
                  "Biodegradable, non-toxic cleaning solutions",
                  "Water-efficient cleaning methods",
                  "Proper recycling and waste management",
                  "Safe for people, pets, and the planet",
                ].map((promise, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-2 md:gap-3"
                  >
                    <CheckCircle className="w-4 h-4 md:w-5 md:h-5 text-emerald-300 flex-shrink-0 mt-0.5" />
                    <span className="text-white text-xs md:text-sm">
                      {promise}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Link
              to={`/services/${selectedService.id}`}
              className="inline-flex items-center gap-2 px-6 py-3 md:px-8 md:py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-semibold shadow-xl text-sm md:text-base"
            >
              Learn More About This Service
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}