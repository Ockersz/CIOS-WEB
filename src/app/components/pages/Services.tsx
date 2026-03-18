import image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246 from '../../../assets/8fea4c5ef9eb269dfb675b419c51c4d62a3cb246.png';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Building2, GraduationCap, Heart, Bus, Shield, TreePine, Home, Sparkles as SparklesIcon, Droplets, Leaf, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

export function Services() {
  const services = [
    {
      id: 'commercial',
      icon: Building2,
      title: 'Commercial & Industrial Cleaning',
      description:
        'We offer a comprehensive range of cleaning services tailored to meet both regular maintenance needs and specialist tasks like carpet and window cleaning. With years of experience, our team delivers reliable service that aligns with your requirements and budget, whether it is a one-time job or a recurring arrangement.',
      image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=600',
    },
    {
      id: 'educational',
      icon: GraduationCap,
      title: 'Educational Cleaning',
      description:
        'For educational institutions, maintaining a clean and hygienic environment is crucial. Our school and university cleaning services are specially designed to foster a safe and healthy atmosphere for students, teachers, and staff.',
      image: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600',
    },
    {
      id: 'medical',
      icon: Heart,
      title: 'Medical Facility Services',
      description:
        'Healthcare-grade cleaning and sanitization for hospitals, clinics, and medical facilities. Strict infection control protocols and compliance with healthcare regulations.',
      image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=600',
    },
    {
      id: 'transport',
      icon: Bus,
      title: 'Transport Cleaning',
      description:
        'Professional cleaning for buses, trains, trams, and commercial vehicles. Interior and exterior cleaning with specialized sanitization for passenger safety.',
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600',
    },
    {
      id: 'infection-control',
      icon: Shield,
      title: 'Infection Control Cleaning',
      description:
        'Advanced disinfection and infection control services using hospital-grade protocols. Rapid response for outbreak situations and preventative maintenance.',
      image: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=600',
    },
    {
      id: 'landscaping',
      icon: TreePine,
      title: 'Landscaping & Ground Maintenance',
      description:
        'Professional landscaping services to maintain beautiful outdoor spaces. Lawn maintenance, garden care, and outdoor area cleaning for commercial and residential properties.',
      image: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=600',
    },
    {
      id: 'residential',
      icon: Home,
      title: 'Residential & Car Cleaning',
      description:
        'Complete home cleaning and vehicle detailing services. From deep cleaning to regular maintenance, keeping your personal spaces spotless and well-maintained.',
      image: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=600',
    },
  ];

  const greenFeatures = [
    {
      icon: SparklesIcon,
      title: 'Deep Cleaning Magic',
      description: 'Exceptional results',
    },
    {
      icon: Droplets,
      title: 'Tailored Solutions',
      description: 'Customized for you',
    },
    {
      icon: Leaf,
      title: 'Sustainable Cleanliness',
      description: 'Eco-friendly products',
    },
    {
      icon: Clock,
      title: 'Quick and Efficient',
      description: 'Fast & reliable',
    },
  ];

  return (
    <div className="w-full">
      {/* Green Hero Section with Nature Background */}
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1752097439317-daa5cf0b7dd1?w=1920"
            alt="Nature background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* CIOS Logo */}
            <div className="flex justify-center mb-8">
              <img src={image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246} alt="CIOS" className="w-32 h-32 object-cover" />
            </div>

            {/* Save Our Planet Text */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-4"
            >
              <p className="text-2xl md:text-3xl text-[#F4C430] italic font-light mb-2">
                Save Our Planet —
              </p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl mb-3">
                <span className="text-[#F4C430]">CIOS GREEN CLEANING INITIATIVE.</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 uppercase tracking-wide">
                MAKING THE WORLD A MUCH BETTER PLACE!
              </p>
            </motion.div>
          </motion.div>

          {/* Our Wide Area of Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16"
          >
            <h2 className="text-3xl md:text-4xl text-center mb-8 text-[#F4C430]">
              Our Wide Area of Services
            </h2>

            {/* Green Features Pills */}
            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {greenFeatures.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-gradient-to-r from-[#F4C430]/90 to-[#e5b520]/90 backdrop-blur-sm px-6 py-4 rounded-full flex items-center gap-3 border-2 border-[#F4C430]"
                >
                  <feature.icon className="w-6 h-6 text-[#3D1810]" />
                  <div className="text-left">
                    <div className="font-semibold text-[#3D1810] text-sm">{feature.title}</div>
                    <div className="text-xs text-[#3D1810]/80">{feature.description}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Services Grid with Green Accents */}
      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <Link
                  to={`/services/${service.id}`}
                  className="block group h-full"
                >
                  <div className="bg-gradient-to-br from-[#F4C430]/10 to-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all h-full flex flex-col border-4 border-[#F4C430]/30 hover:border-emerald-500 relative overflow-hidden">
                    {/* Service Image */}
                    <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
                      <ImageWithFallback
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {/* Green Icon Badge */}
                      <div className="absolute bottom-3 right-3 w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full flex items-center justify-center border-4 border-[#F4C430] shadow-xl">
                        <service.icon className="w-8 h-8 text-white" />
                      </div>
                    </div>

                    {/* Service Content */}
                    <div className="flex-grow">
                      <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>

                    {/* Eco Badge */}
                    <div className="mt-4 flex items-center gap-2 text-emerald-600">
                      <Leaf className="w-5 h-5" />
                      <span className="text-sm font-medium">Eco-Friendly Service</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Green CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              <Leaf className="w-16 h-16 text-[#F4C430]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Join Our Green Cleaning Revolution
            </h2>
            <p className="text-xl mb-8 text-emerald-50">
              Experience professional cleaning that cares for your space and our planet. 
              Get a free quote today and make a difference!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/get-quote"
                className="inline-flex items-center justify-center px-10 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-semibold shadow-xl"
              >
                Get Your Free Quote
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/about"
                className="inline-flex items-center justify-center px-10 py-4 bg-white/10 border-2 border-white/30 text-white rounded-full hover:bg-white/20 transition-all font-semibold backdrop-blur-sm"
              >
                Learn More About Us
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
