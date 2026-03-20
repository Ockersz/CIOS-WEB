import image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246 from '../../assets/8fea4c5ef9eb269dfb675b419c51c4d62a3cb246.png';
import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import {
  Building2,
  ChevronRight,
  Droplets,
  GraduationCap,
  HeartPulse,
  Home,
  Leaf,
  Recycle,
  ShieldCheck,
  Trees,
  Truck,
} from "lucide-react";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { ServiceSummary, useServices } from "../lib/api";

const serviceIcons: Record<string, any> = {
  commercial: Building2,
  educational: GraduationCap,
  medical: HeartPulse,
  transport: Truck,
  "infection-control": ShieldCheck,
  landscaping: Trees,
  residential: Home,
};

export function ServiceSelector() {
  const { data: services, loading } = useServices();
  const [selectedService, setSelectedService] = useState<ServiceSummary | null>(null);
  const homeServices = (services || []).filter((service) => service.showOnHome !== false);

  useEffect(() => {
    if (!homeServices.length) {
      setSelectedService(null);
      return;
    }

    if (!selectedService || !homeServices.some((service) => service.id === selectedService.id)) {
      setSelectedService(homeServices[0]);
    }
  }, [selectedService, homeServices]);

  if (loading && !selectedService) {
    return <section className="py-20 text-center text-white bg-[#1d1d1d]">Loading services...</section>;
  }

  if (!selectedService || !homeServices.length) {
    return null;
  }

  return (
    <section className="relative py-12 md:py-20 overflow-hidden">
      <div className="absolute inset-0">
        <ImageWithFallback
          src="https://images.unsplash.com/photo-1752097439317-daa5cf0b7dd1?w=1920"
          alt="Nature background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
      </div>

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--brand-accent)] rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-400 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-8 md:mb-12"
        >
          <div className="flex justify-center mb-4 md:mb-6">
            <img
              src={image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246}
              alt="CIOS"
              className="w-16 h-16 md:w-24 md:h-24 object-contain"
            />
          </div>

          <div className="inline-flex items-center gap-2 bg-[var(--brand-accent)] text-black px-4 py-2 md:px-6 md:py-3 rounded-full button-text mb-3 md:mb-4">
            <Leaf className="w-4 h-4 md:w-5 md:h-5" />
            <span className="eyebrow-label text-xs md:text-sm">Save Our Planet</span>
          </div>

          <h2 className="hero-title text-4xl md:text-6xl lg:text-7xl text-white mb-2 md:mb-3 px-2">
            <span className="text-[var(--brand-accent)]">CIOS GREEN CLEANING INITIATIVE</span>
          </h2>
          <p className="body-copy text-base md:text-xl lg:text-2xl text-white/85 mb-4 md:mb-8 px-2">
            Our Wide Area of Services
          </p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-4 mt-4 md:mt-8 px-2">
            {[
              { icon: Leaf, text: "Eco-Friendly Products" },
              { icon: Droplets, text: "Water Conservation" },
              { icon: Recycle, text: "Sustainable Practices" },
            ].map((benefit) => (
              <div
                key={benefit.text}
                className="bg-white/10 backdrop-blur-sm px-3 py-2 md:px-5 md:py-3 rounded-full flex items-center gap-2 border border-white/20"
              >
                <benefit.icon className="w-4 h-4 md:w-5 md:h-5 text-[var(--brand-accent)]" />
                <span className="body-copy text-white text-xs md:text-sm">{benefit.text}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mb-8 md:mb-12">
          <div className="bg-gradient-to-r from-white to-gray-50 rounded-xl md:rounded-2xl shadow-2xl overflow-hidden border-2 md:border-4 border-[var(--brand-accent)]">
            <div className="grid grid-cols-5 sm:grid-cols-6 md:grid-cols-4 lg:grid-cols-7">
              {homeServices.map((service) => {
                const Icon = serviceIcons[service.id] || Building2;
                const isSelected = selectedService.id === service.id;
                return (
                  <motion.button
                    key={service.id}
                    onClick={() => setSelectedService(service)}
                    className={`relative flex flex-col items-center justify-center gap-1 px-1 py-2 transition-all border-r border-b md:gap-3 md:p-6 lg:border-b-0 last:border-r-0 ${
                      isSelected
                        ? "bg-[var(--brand-eco)] text-white"
                        : "bg-white text-gray-700 hover:bg-[var(--brand-eco-soft)]"
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="relative z-10 flex flex-col items-center gap-1 md:gap-3">
                      <Icon className={`w-5 h-5 md:w-8 md:h-8 ${isSelected ? "text-white" : ""}`} />
                      <span className={`hidden md:block body-copy text-[10px] md:text-sm text-center leading-tight ${isSelected ? "text-white" : ""}`}>
                        {service.label}
                      </span>
                      {service.isEcoFriendly && (
                        <Leaf className={`w-3 h-3 md:w-4 md:h-4 ${isSelected ? "text-[var(--brand-accent)]" : "text-[var(--brand-eco)]"}`} />
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <motion.div
          key={selectedService.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-12 items-center"
        >
          <div className="relative">
            <div className="relative rounded-xl md:rounded-2xl overflow-hidden shadow-2xl border-2 md:border-4 border-[var(--brand-accent)]">
              <ImageWithFallback
                src={selectedService.image}
                alt={selectedService.title}
                className="w-full h-[250px] md:h-[400px] lg:h-[500px] object-cover"
              />
              {selectedService.isEcoFriendly && (
                <div className="absolute top-2 right-2 md:top-4 md:right-4 bg-[var(--brand-eco)] text-white px-3 py-1.5 md:px-4 md:py-2 rounded-full flex items-center gap-1.5 md:gap-2 shadow-xl">
                  <Leaf className="w-4 h-4 md:w-5 md:h-5" />
                  <span className="font-semibold text-xs md:text-sm">GREEN INITIATIVE</span>
                </div>
              )}
            </div>
          </div>

          <div className="text-white">
            <h3 className="section-title text-3xl md:text-4xl lg:text-5xl mb-3 md:mb-4">
              {selectedService.title}
            </h3>
            <p className="body-copy text-gray-100 text-sm md:text-lg mb-4 md:mb-6">
              {selectedService.description}
            </p>

            <div className="bg-[var(--brand-accent-soft)] border-2 border-[var(--brand-accent)] rounded-xl md:rounded-2xl p-4 md:p-6 mb-4 md:mb-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 md:gap-3 mb-3 md:mb-4">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-[var(--brand-accent)] rounded-full flex items-center justify-center">
                  <Leaf className="w-5 h-5 md:w-6 md:h-6 text-black" />
                </div>
                <h4 className="card-title text-lg md:text-2xl text-[var(--brand-accent)]">Our Green Promise</h4>
              </div>
              <p className="body-copy text-sm md:text-base text-gray-100">
                Every service is designed around environmentally responsible products, efficient processes, and safe outcomes for your team, family, and the spaces you rely on.
              </p>
            </div>

            <Link
              to={`/services/${selectedService.id}`}
              className="button-text inline-flex items-center justify-center px-8 py-4 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-all transform hover:scale-105 shadow-xl"
            >
              View Service Details
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
