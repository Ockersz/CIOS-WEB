import image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246 from '../../../assets/8fea4c5ef9eb269dfb675b419c51c4d62a3cb246.png';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { Building2, ChevronRight, Clock, Droplets, GraduationCap, Heart, Home, Leaf, Shield, Sparkles as SparklesIcon, TreePine, Bus } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useCmsPage, useServices } from '../../lib/api';
import { iconMap } from '../../lib/iconMap';

const serviceIcons: Record<string, any> = {
  commercial: Building2,
  educational: GraduationCap,
  medical: Heart,
  transport: Bus,
  'infection-control': Shield,
  landscaping: TreePine,
  residential: Home,
};

export function Services() {
  const { data: page } = useCmsPage<any>('services');
  const { data: services } = useServices();
  const features = page?.content?.greenFeatures || [];
  const cta = page?.content?.cta;

  return (
    <div className="w-full">
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src="https://images.unsplash.com/photo-1752097439317-daa5cf0b7dd1?w=1920"
            alt="Nature background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex justify-center mb-8">
              <img src={image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246} alt="CIOS" className="w-32 h-32 object-cover" />
            </div>

            <div className="mb-4">
              <p className="text-2xl md:text-3xl text-[#F4C430] italic font-light mb-2">Save Our Planet</p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl mb-3">
                <span className="text-[#F4C430]">{page?.heroTitle}</span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 uppercase tracking-wide">{page?.heroSubtitle}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16">
            <h2 className="text-3xl md:text-4xl text-center mb-8 text-[#F4C430]">{page?.heroDescription}</h2>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {features.map((feature: any) => {
                const Icon = iconMap[feature.icon as keyof typeof iconMap] || SparklesIcon;
                return (
                  <div
                    key={feature.title}
                    className="bg-gradient-to-r from-[#F4C430]/90 to-[#e5b520]/90 backdrop-blur-sm px-6 py-4 rounded-full flex items-center gap-3 border-2 border-[#F4C430]"
                  >
                    <Icon className="w-6 h-6 text-[#3D1810]" />
                    <div className="text-left">
                      <div className="font-semibold text-[#3D1810] text-sm">{feature.title}</div>
                      <div className="text-xs text-[#3D1810]/80">{feature.description}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {(services || []).map((service, index) => {
              const Icon = serviceIcons[service.id] || Building2;
              return (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link to={`/services/${service.id}`} className="block group h-full">
                    <div className="bg-gradient-to-br from-[#F4C430]/10 to-white p-6 rounded-3xl shadow-lg hover:shadow-2xl transition-all h-full flex flex-col border-4 border-[#F4C430]/30 hover:border-emerald-500 relative overflow-hidden">
                      <div className="relative h-48 mb-4 rounded-2xl overflow-hidden">
                        <ImageWithFallback
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute bottom-3 right-3 w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-800 rounded-full flex items-center justify-center border-4 border-[#F4C430] shadow-xl">
                          <Icon className="w-8 h-8 text-white" />
                        </div>
                      </div>

                      <div className="flex-grow">
                        <h3 className="text-2xl font-bold mb-3 text-gray-900">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </div>

                      <div className="mt-4 flex items-center gap-2 text-emerald-600">
                        <Leaf className="w-5 h-5" />
                        <span className="text-sm font-medium">Eco-Friendly Service</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {cta && (
        <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <Leaf className="w-16 h-16 text-[#F4C430]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">{cta.title}</h2>
            <p className="text-xl mb-8 text-emerald-50">{cta.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-quote" className="inline-flex items-center justify-center px-10 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-semibold shadow-xl">
                {cta.primaryLabel}
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/about" className="inline-flex items-center justify-center px-10 py-4 bg-white/10 border-2 border-white/30 text-white rounded-full hover:bg-white/20 transition-all font-semibold backdrop-blur-sm">
                {cta.secondaryLabel}
              </Link>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
