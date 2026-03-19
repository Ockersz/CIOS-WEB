import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronRight, Leaf, Recycle, Droplets, Shield, CheckCircle } from 'lucide-react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import ciosLogo from '../../../imports/cioslogo.svg';
import { useService } from '../../lib/api';

export function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const { data: service, loading } = useService(serviceId);

  if (loading && !service) {
    return <div className="w-full min-h-screen flex items-center justify-center">Loading service...</div>;
  }

  if (!service) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-4xl mb-4 text-gray-900">Service Not Found</h1>
          <Link to="/services" className="text-emerald-600 hover:underline text-lg font-medium">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={service.heroImage} alt={service.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-800/70 to-emerald-900/80"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex justify-center mb-8">
              <img src={ciosLogo} alt="CIOS" className="w-24 h-24 object-contain" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">{service.title}</h1>
            <div className="inline-flex items-center gap-2 bg-[#F4C430] text-black px-6 py-3 rounded-full font-semibold">
              <Leaf className="w-5 h-5" />
              <span>ECO-FRIENDLY SERVICE</span>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <p className="text-gray-700 leading-relaxed text-lg mb-8">{service.description}</p>

              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-4 border-emerald-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900">Our Green Cleaning Promise</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Eco-Friendly Products</h4>
                      <p className="text-emerald-800 text-sm">Biodegradable, non-toxic cleaning solutions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Droplets className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Water Conservation</h4>
                      <p className="text-emerald-800 text-sm">Efficient cleaning methods that reduce water waste</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Recycle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Sustainable Practices</h4>
                      <p className="text-emerald-800 text-sm">Recycling and proper waste management protocols</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Safe for All</h4>
                      <p className="text-emerald-800 text-sm">Products safe for people, pets, and the planet</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#F4C430]">
              <ImageWithFallback src={service.detailImage} alt={service.title} className="w-full h-full object-cover" />
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mb-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our {service.title.replace('Cleaning', '').trim()} Services Include:
            </h2>
            <p className="text-lg text-gray-600">
              All services performed with eco-friendly products and sustainable practices
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.items.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-[#F4C430]/10 to-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-4 border-emerald-200 hover:border-emerald-400 group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 flex-grow">{item.title}</h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-13">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex justify-center mb-6">
            <Leaf className="w-16 h-16 text-[#F4C430]" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to Go Green?</h2>
          <p className="text-xl mb-8 text-emerald-50">
            Experience professional {service.title.toLowerCase()} that cares for your space and our planet.
            Get your free eco-friendly quote today!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/get-quote" className="inline-flex items-center justify-center px-10 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-semibold shadow-xl">
              Get Your Free Quote
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
            <Link to="/services" className="inline-flex items-center justify-center px-10 py-4 bg-white/10 border-2 border-white/30 text-white rounded-full hover:bg-white/20 transition-all font-semibold backdrop-blur-sm">
              View All Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
