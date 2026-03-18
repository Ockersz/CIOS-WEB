import image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246 from '../../../assets/8fea4c5ef9eb269dfb675b419c51c4d62a3cb246.png';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  Award,
  Users,
  Building2,
  Heart,
  Leaf,
  CheckCircle,
  Shield,
  ShieldCheck,
  Clock,
  Target,
  Phone,
  ChevronRight,
  Sparkles as SparklesIcon
} from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import ciosLogo from 'figma:asset/6372cb420fc0690c19c4c9f66ad33b20d184313c.png';

export function About() {
  const values = [
    {
      icon: Target,
      title: 'Our Mission',
      description:
        'To deliver exceptional, environmentally responsible cleaning services that create healthier, safer, and more sustainable spaces for our clients and communities.',
    },
    {
      icon: Heart,
      title: 'Our Values',
      description:
        'Trust, loyalty, attention to detail, and environmental stewardship are at the core of everything we do.',
    },
    {
      icon: Leaf,
      title: 'Our Commitment',
      description:
        'Quality workmanship using eco-friendly products, reliable service, and 100% satisfaction guaranteed on every job.',
    },
  ];

  const stats = [
    { number: '10+', label: 'Successful Years' },
    { number: '100+', label: 'Active Clients' },
    { number: '350+', label: 'Staff Members' },
    { number: '24/7', label: 'Support Available' },
  ];

  const whyChooseUs = [
    {
      icon: Users,
      title: 'Proficient Team',
      description: 'Our staff undergoes rigorous training in both cleaning excellence and eco-friendly practices. All team members are fully vetted with background checks.'
    },
    {
      icon: Shield,
      title: 'Fully Insured & Compliant',
      description: 'Comprehensive insurance coverage and full compliance with Victorian OHS standards. We maintain all necessary certifications for your peace of mind.'
    },
    {
      icon: Clock,
      title: 'Flexible & Reliable',
      description: 'We work around your schedule with convenient appointment times. 24/7 support ensures we\'re always available when you need us.'
    },
    {
      icon: Leaf,
      title: 'Eco-Friendly Solutions',
      description: 'We use biodegradable, non-toxic cleaning products that are safe for your team, family, pets, and the environment.'
    },
    {
      icon: Target,
      title: 'Tailored Solutions',
      description: 'Every client has unique needs. We customize our services to align with your specific requirements and budget.'
    },
    {
      icon: Award,
      title: 'Quality Guaranteed',
      description: 'Our commitment to excellence is backed by industry certifications and a satisfaction guarantee. Quality you can trust, every time.'
    }
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        {/* Background with Brand Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3D1810] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* CIOS Logo */}
            <div className="flex justify-center mb-8">
              <img src={image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246} alt="CIOS" className="w-32 h-32 object-contain" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-[#F4C430]">CIOS</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-4">
              Dependable Commercial Cleaning Services Since 2016
            </p>
            <p className="text-lg text-gray-300">
              Built on trust, loyalty, and attention to detail – delivering eco-friendly cleaning excellence across Australia
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl md:text-5xl text-[#F4C430] font-bold mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-[#F4C430]" />
                <span className="text-gray-600 uppercase tracking-wide text-sm font-medium">
                  OUR STORY
                </span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                A Decade of <span className="text-[#F4C430]">Excellence</span>
              </h2>
              
              <p className="text-gray-700 leading-relaxed mb-4 text-lg">
                Established in 2016, CIOS Cleaning & Detailing brings over a decade of industry experience delivering reliable, high-quality cleaning services across commercial, industrial, and retail facilities throughout Australia.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-4">
                Built on trust, loyalty, and unwavering attention to detail, we tailor our services to meet the unique needs of every client. Through continuous improvement, trained staff, and structured operational systems, we ensure consistent results and professional service delivery every single time.
              </p>
              
              <p className="text-gray-700 leading-relaxed mb-6">
                Our commitment to environmental sustainability sets us apart. We've pioneered the CIOS Green Cleaning Initiative, using eco-friendly products and sustainable practices that protect both your space and our planet.
              </p>

              <div className="space-y-3 mb-8">
                {[
                  'Industry-leading eco-friendly cleaning solutions',
                  'Fully trained and certified cleaning professionals',
                  'Comprehensive insurance and safety compliance',
                  'Customized cleaning programs for every client'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F4C430] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#F4C430]">
                <ImageWithFallback
                  src="https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800"
                  alt="CIOS Cleaning Team at Work"
                  className="w-full h-[500px] object-cover"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">What Drives Us</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Our core values guide every decision we make and every service we deliver
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-all border-2 border-gray-200 group"
              >
                <div className="w-16 h-16 mx-auto mb-4 bg-[#F4C430] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <value.icon className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">{value.title}</h3>
                <p className="text-gray-600 leading-relaxed">{value.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Why Choose CIOS?</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">
              Experience the difference that professional, eco-friendly cleaning makes
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {whyChooseUs.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all"
              >
                <div className="w-12 h-12 mb-4 bg-[#F4C430] rounded-xl flex items-center justify-center">
                  <item.icon className="w-6 h-6 text-black" />
                </div>
                <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                <p className="text-gray-300 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Accreditations Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center gap-2 mb-4">
              <Award className="w-6 h-6 text-[#F4C430]" />
              <span className="text-gray-600 uppercase tracking-wide text-sm font-medium">
                CERTIFICATIONS & ACCREDITATIONS
              </span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">Professional Standards & Compliance</h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Our commitment to excellence is backed by industry-leading certifications and memberships
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Infection Control */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-gray-50 to-white border-4 border-[#F4C430] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-[#F4C430] rounded-xl flex items-center justify-center">
                  <ShieldCheck className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Infection Control</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Prevention & Control Certified',
                  'Cleaning Staff Hygiene Certified',
                  'Awareness Training Programs',
                  'Hospital-Grade Protocols'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#F4C430] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
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
              className="bg-gradient-to-br from-gray-50 to-white border-4 border-[#F4C430] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-[#F4C430] rounded-xl flex items-center justify-center">
                  <Shield className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Health & Safety</h3>
              </div>
              <div className="space-y-4">
                {[
                  'Victoria OHS Compliant',
                  'Victorian OHS Trained Staff',
                  'RTO-Certified Safety Training',
                  'Risk Management Systems',
                  'Comprehensive Insurance'
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-[#F4C430] flex-shrink-0 mt-0.5" />
                    <span className="text-gray-700">{item}</span>
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
              className="bg-gradient-to-br from-gray-50 to-white border-4 border-[#F4C430] rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 bg-[#F4C430] rounded-xl flex items-center justify-center">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Industry Memberships</h3>
              </div>
              <div className="space-y-4">
                {[
                  { name: 'NACLA', full: 'National Association of Cleaning & Laundry' },
                  { name: 'ISSA', full: 'International Sanitary Supply Association' },
                  { name: 'BSCAA', full: 'Building Service Contractors Association' }
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Award className="w-5 h-5 text-[#F4C430] flex-shrink-0 mt-0.5" />
                    <div>
                      <div className="text-gray-900 font-semibold">{item.name}</div>
                      <div className="text-gray-600 text-sm">{item.full}</div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Experience CIOS?</h2>
            <p className="text-xl text-gray-300 mb-8">
              Contact us today for a free consultation and discover why leading organizations trust CIOS for their cleaning needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/get-quote"
                className="inline-flex items-center justify-center px-10 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-semibold shadow-xl"
              >
                Get Your Free Quote
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <a
                href="tel:+61038907188"
                className="inline-flex items-center justify-center px-10 py-4 bg-white/10 border-2 border-white/30 text-white rounded-full hover:bg-white/20 transition-all font-semibold backdrop-blur-sm"
              >
                <Phone className="mr-2 w-5 h-5" />
                Call Us Now
              </a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}