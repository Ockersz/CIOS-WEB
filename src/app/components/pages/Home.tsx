import { motion } from "motion/react";
import { Link } from "react-router";
import { Sparkles } from "../Sparkles";
import { ServiceSelector } from "../ServiceSelector";
import { BeforeAfter } from "../BeforeAfter";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import {
  Home as HomeIcon,
  Building2,
  Factory,
  Car,
  Clock,
  Shield,
  Award,
  Star,
  ChevronRight,
  Briefcase,
  Leaf,
  Sparkles as SparklesIcon,
  CheckCircle,
  Phone,
  ShieldCheck,
  Users,
  GraduationCap,
  FileCheck,
  Building,
  Handshake,
  Heart,
  TrendingUp,
  UserPlus,
} from "lucide-react";
import heroImage from "../../../assets/d89780a9d6e8f6f73ead4861c83cec8dc2d75dc6.png";
import aboutImage from "../../../assets/90942495400356f7c45438d3ac22e381b6424f31.png";
import clientsImage from "../../../assets/59e7371e83382b96ce3d92410fd77fc45e607be2.png";
import certificationsImage from "../../../assets/5159d01704643f5912888e1e27c6c61c948555a6.png";
import heroBackgroundImage from "../../../assets/7ca8818179e3f3b71f754641ebc815ec081dd833.png";

export function Home() {
  const services = [
    {
      icon: HomeIcon,
      title: "Residential Cleaning",
      description: "Professional home cleaning services",
    },
    {
      icon: Building2,
      title: "Commercial Cleaning",
      description: "Office and business cleaning",
    },
    {
      icon: Factory,
      title: "Industrial Cleaning",
      description: "Heavy-duty industrial solutions",
    },
    {
      icon: Car,
      title: "Car Detailing",
      description: "Complete auto cleaning services",
    },
    {
      icon: Briefcase,
      title: "Office Cleaning",
      description: "Workspace sanitization",
    },
    {
      icon: Leaf,
      title: "Eco-Friendly",
      description: "Green cleaning solutions",
    },
  ];

  const testimonials = [
    {
      name: "Peter Labbard",
      role: "Managing Director, IRS International",
      text: "Our company iRS iRS International are a Cremental Contractors to this come a Reinag related company Australia New-Awe they will has a oedema. Welcoming and the trust being xcularacy office environment starting this service has xtemble paxitto parking our office. Due are 24 from presents.",
      rating: 5,
    },
    {
      name: "Oedema Institute",
      role: "SIGVARIS GROUP",
      text: "CIOS Integrated Services has been an exceptional cleaning partner for the Oedema Institute. Their team understands the importance of hygiene, infection control, and discretion, within a clinical environment. They are reliable, thorough, and always maintain a professional presence on-site. We have complete confidence in their ability to meet healthcare grade cleaning standards.",
      rating: 5,
    },
    {
      name: "Harry Katsibanis",
      role: "Director, STORAGE X",
      text: "CIOS Cleaning & Detailing has delivered outstanding service across our facility. Their team is punctual, well-presented, and proactive in maintaining both ditional and external areas. Communication is seamless, and any requests are handled promptly and efficiently. We value their attention to maintaining high standard of presentation.",
      rating: 5,
    },
  ];

  const blogPosts = [
    {
      title: "10 Tips for Maintaining a Clean Home",
      date: "March 10, 2026",
      category: "Home Tips",
    },
    {
      title: "The Benefits of Professional Office Cleaning",
      date: "March 8, 2026",
      category: "Business",
    },
    {
      title: "Eco-Friendly Cleaning: Why It Matters",
      date: "March 5, 2026",
      category: "Green Living",
    },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32 overflow-hidden">
        {/* Background Image Overlay */}
        <div
          className="absolute inset-0 z-0 opacity-100"
          style={{
            backgroundImage: `url(${heroBackgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-[#3D1810]/60 to-gray-900/60 z-[1]" />
        <Sparkles count={30} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-5xl lg:text-6xl mb-6 leading-tight">
                One Service. Every Space – Commercial,
                Residential & Vehicle Brilliance
              </h1>
              <p className="text-lg md:text-xl mb-8 text-gray-300">
                Providing Premium Cleaning Services for
                Commercial, Residential & Vehicle Spaces – With
                Impeccable Attention to Detail and Elegance.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/get-quote"
                  className="px-8 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 text-center font-medium"
                >
                  Enquire About Free Service
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <div className="text-4xl text-[#F4C430] mb-2">
                100+
              </div>
              <div className="text-gray-600">
                Active Clients
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <div className="text-4xl text-[#F4C430] mb-2">
                10+
              </div>
              <div className="text-gray-600">
                Successful Years
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <div className="text-4xl text-[#F4C430] mb-2">
                350+
              </div>
              <div className="text-gray-600">Staff Members</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
            >
              <div className="text-4xl text-[#F4C430] mb-2">
                24/7
              </div>
              <div className="text-gray-600">
                Support Available
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Image collage */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Asymmetrical/Messy Grid Layout */}
              <div className="relative h-[600px]">
                {/* Image 1 - Top Left */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                  className="absolute top-0 left-0 w-[48%] h-[38%]"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1758273705723-26ef454252ce?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGNsZWFuaW5nJTIwb2ZmaWNlfGVufDF8fHx8MTc3Mzc1Mzk5N3ww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Professional cleaning team member at work"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                </motion.div>

                {/* Image 2 - Top Right, with gap */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="absolute top-[12%] right-0 w-[45%] h-[35%] z-10"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1765111387588-7583e56bc2fb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb21tZXJjaWFsJTIwY2xlYW5pbmclMjBzZXJ2aWNlJTIwd29ya3xlbnwxfHx8fDE3NzM3NTM5OTh8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Commercial cleaning in progress"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                </motion.div>

                {/* Image 3 - Bottom Left, offset with gap */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="absolute bottom-[15%] left-[8%] w-[38%] h-[36%]"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1644890550788-3ca4ee5c3bc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvZmZpY2UlMjBjbGVhbmluZyUyMHRlYW0lMjB3b3JrZXJzfGVufDF8fHx8MTc3Mzc1Mzk5OHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Cleaning team working together"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                </motion.div>

                {/* Image 4 - Bottom Right, with gap */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="absolute bottom-0 right-[5%] w-[48%] h-[42%] z-10"
                >
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"
                    alt="Quality cleaning service"
                    className="w-full h-full object-cover rounded-2xl shadow-lg"
                  />
                </motion.div>
              </div>

              {/* 10+ Years Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, type: "spring" }}
                className="absolute -bottom-6 -left-6 bg-[#F4C430] text-black px-8 py-6 rounded-2xl shadow-2xl z-20"
              >
                <div className="text-5xl font-bold text-center">
                  10+
                </div>
                <div className="text-sm text-center font-medium">
                  Successful
                  <br />
                  Years
                </div>
              </motion.div>
            </motion.div>

            {/* Right side - Content */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-[#F4C430]" />
                <span className="text-[#6B7280] uppercase tracking-wide text-sm font-medium">
                  ABOUT US
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl mb-6 text-gray-900">
                Dependable Commercial Cleaning Services
              </h2>

              <p className="text-gray-600 mb-4 leading-relaxed">
                Established in 2016, CIOS Cleaning & Detailing
                brings over a decade of industry experience
                delivering reliable, high-quality cleaning
                services across commercial and retail
                facilities.
              </p>

              <p className="text-gray-600 mb-8 leading-relaxed">
                Built on trust, loyalty, and attention to
                detail, we tailor our services to meet the
                unique needs of every client. Through continuous
                improvement, trained staff, and structured
                operational systems, we ensure consistent
                results and professional service delivery.
              </p>

              {/* Bullet Points */}
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F4C430] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-gray-700">
                    Proficient Team at your service
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F4C430] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-gray-700">
                    Tailored Solutions to your need
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#F4C430] flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-4 h-4 text-black" />
                  </div>
                  <span className="text-gray-700">
                    Reliable Quality every time or your money
                    back.
                  </span>
                </div>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/get-quote"
                  className="px-8 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-colors font-medium text-center uppercase tracking-wide"
                >
                  Enquire Now
                </Link>
                <a
                  href="tel:+61038907188"
                  className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-full hover:border-[#F4C430] transition-colors font-medium text-center flex items-center justify-center gap-3"
                >
                  <Phone className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-xs text-gray-500">
                      Call Us
                    </div>
                    <div className="text-sm font-semibold">
                      +61 03 8907 1881
                    </div>
                  </div>
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Service Selector */}
      <ServiceSelector />

      {/* Office & Home Evolution */}
      <BeforeAfter />

      {/* Wide Area of Services */}

      {/* Commercial & Industrial */}

      {/* Testimonials */}
      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">
              What People Say About Us
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white text-gray-900 p-8 rounded-2xl shadow-xl"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map(
                    (_, i) => (
                      <Star
                        key={i}
                        className="w-5 h-5 fill-[#F4C430] text-[#F4C430]"
                      />
                    ),
                  )}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.text}"
                </p>
                <div>
                  <div className="text-lg">
                    {testimonial.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {testimonial.role}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Clients Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Handshake className="w-6 h-6 text-[#F4C430]" />
              <span className="text-[#6B7280] uppercase tracking-wide text-sm font-medium">
                OUR CLIENTS
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-4 text-gray-900">
              Trusted by Leading Organizations
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We're proud to serve a diverse range of clients
              across Australia, delivering exceptional cleaning
              services every day.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[
              { name: "VISY", icon: Building },
              {
                name: "National Combined Services",
                icon: Building2,
              },
              { name: "IRS International", icon: Building },
              { name: "acan group", icon: Building2 },
              { name: "ARA Property Services", icon: Building },
              { name: "Victorian Hearing", icon: Building2 },
              { name: "SIGVARIS GROUP", icon: Building },
              { name: "IGA", icon: Building2 },
              { name: "oedema institute", icon: Building },
            ].map((client, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:border-[#F4C430] hover:shadow-lg transition-all group"
              >
                <div className="flex flex-col items-center justify-center text-center h-full">
                  <client.icon className="w-10 h-10 text-gray-400 group-hover:text-[#F4C430] transition-colors mb-3" />
                  <span className="text-gray-700 font-medium text-sm">
                    {client.name}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Accreditations Section */}
      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-6 h-6 text-[#F4C430]" />
              <span className="text-gray-300 uppercase tracking-wide text-sm font-medium">
                CERTIFICATIONS & ACCREDITATIONS
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl mb-4">
              Professional Standards & Compliance
            </h2>
            <p className="text-gray-300 max-w-2xl mx-auto">
              Our commitment to excellence is backed by
              industry-leading certifications and memberships.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Infection Control */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#F4C430] rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold">
                  Infection Control
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Prevention & Control",
                  "Cleaning Staff Hygiene Certified",
                  "Awareness Training",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-[#F4C430] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Health & Safety Compliance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#F4C430] rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold">
                  Health & Safety
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  "Victoria Compliant",
                  "Victorian OHS Trained Staff",
                  "RTO-Certified Safety Training",
                  "Risk Management Systems",
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <CheckCircle className="w-5 h-5 text-[#F4C430] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-300">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Industry Memberships */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-[#F4C430] rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-2xl font-bold">
                  Industry Memberships
                </h3>
              </div>
              <div className="space-y-4">
                {[
                  {
                    name: "NACLA",
                    full: "National Association of Cleaning & Laundry",
                  },
                  {
                    name: "ISSA",
                    full: "International Sanitary Supply Association",
                  },
                  {
                    name: "BSCAA",
                    full: "Building Service Contractors Association",
                  },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3"
                  >
                    <Award className="w-5 h-5 text-[#F4C430] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-white font-semibold">
                        {item.name}
                      </div>
                      <div className="text-gray-400 text-sm">
                        {item.full}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Blog Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">
              Explore Our Cleaning Blog
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                <div className="bg-gray-200 h-48" />
                <div className="p-6">
                  <div className="text-sm text-[#F4C430] mb-2">
                    {post.category}
                  </div>
                  <h3 className="text-xl mb-2">{post.title}</h3>
                  <div className="text-sm text-gray-500">
                    {post.date}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/blog"
              className="inline-flex items-center px-6 py-3 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-colors"
            >
              View All Posts <ChevronRight className="ml-2" />
            </Link>
          </div>
        </div>
      </section>

      {/* Join Our Team Section */}
      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white relative overflow-hidden">
        <Sparkles count={20} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-[#F4C430]" />
                <span className="text-gray-300 uppercase tracking-wide text-sm font-medium">
                  CAREERS
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl mb-6 leading-tight">
                Join Our Growing Team
              </h2>

              <p className="text-gray-300 mb-8 text-lg leading-relaxed">
                Be part of a company that values excellence,
                integrity, and growth. We're always looking for
                passionate individuals who take pride in
                delivering exceptional service.
              </p>

              {/* Benefits List */}
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4C430]/20 flex items-center justify-center flex-shrink-0">
                    <Heart className="w-5 h-5 text-[#F4C430]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Supportive Culture
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Work in a team that values respect,
                      collaboration, and work-life balance
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4C430]/20 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-5 h-5 text-[#F4C430]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Career Growth
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Professional development opportunities
                      with clear pathways for advancement
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#F4C430]/20 flex items-center justify-center flex-shrink-0">
                    <Award className="w-5 h-5 text-[#F4C430]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white mb-1">
                      Competitive Benefits
                    </h3>
                    <p className="text-gray-400 text-sm">
                      Great pay, training programs, and employee
                      recognition initiatives
                    </p>
                  </div>
                </div>
              </div>

              <Link
                to="/join-team"
                className="inline-flex items-center px-8 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-medium"
              >
                View Open Positions{" "}
                <ChevronRight className="ml-2" />
              </Link>
            </motion.div>

            {/* Right Content - Image Grid */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkaXZlcnNlJTIwdGVhbSUyMG1lZXRpbmclMjBvZmZpY2V8ZW58MXx8fHwxNzQyNDM5NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Team collaboration"
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                  />
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1531537571171-a707bf2683da?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoYXBweSUyMHdvcmtlciUyMHNtaWxpbmd8ZW58MXx8fHwxNzQyNDM5NjAwfDA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Happy team member"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                </div>
                <div className="space-y-4 pt-8">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0ZWFtJTIwd29ya2luZyUyMHRvZ2V0aGVyfGVufDF8fHx8MTc0MjQzOTYwMHww&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Team working together"
                    className="w-full h-64 object-cover rounded-2xl shadow-lg"
                  />
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1556761175-b413da4baf72?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB0ZWFtJTIwZGlzY3Vzc2lvbnxlbnwxfHx8fDE3NDI0Mzk2MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Professional discussion"
                    className="w-full h-48 object-cover rounded-2xl shadow-lg"
                  />
                </div>
              </div>

              {/* Stats Badge */}
              <motion.div
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, type: "spring" }}
                className="absolute -bottom-6 -left-6 bg-[#F4C430] text-black px-8 py-6 rounded-2xl shadow-2xl"
              >
                <div className="text-5xl font-bold text-center">
                  350+
                </div>
                <div className="text-sm text-center font-medium">
                  Team
                  <br />
                  Members
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
    </div>
  );
}
