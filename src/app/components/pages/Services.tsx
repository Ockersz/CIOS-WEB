import image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246 from '../../../assets/8fea4c5ef9eb269dfb675b419c51c4d62a3cb246.png';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { SiteIcon } from '../SiteIcon';
import { Building2, ChevronRight, Clock, Droplets, GraduationCap, Heart, Home, Leaf, Shield, Sparkles as SparklesIcon, TreePine, Bus } from 'lucide-react';
import { Link } from 'react-router';
import { motion } from 'motion/react';
import { useCmsPage, useServices } from '../../lib/api';
import { Seo } from '../Seo';
import { buildPageTitle, trimSeoDescription } from '../../lib/seo';

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
  const heroImage =
    page?.content?.heroImage ||
    "https://images.unsplash.com/photo-1752097439317-daa5cf0b7dd1?auto=format&fit=crop&w=1920&q=80";

  return (
    <div className="w-full">
      <Seo
        title={buildPageTitle('Cleaning Services')}
        description={trimSeoDescription(page?.heroSubtitle || page?.heroDescription)}
        path="/services"
        image={heroImage}
      />
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={heroImage}
            alt="Nature background"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <div className="flex justify-center mb-8">
              <img src={image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246} alt="CIOS" className="w-32 h-32 object-cover" />
            </div>

            <div className="mb-4">
              <p className="eyebrow-label text-[var(--brand-accent)] mb-3">Save Our Planet</p>
              <h1 className="text-3xl md:text-5xl lg:text-6xl mb-3">
                <span className="hero-title text-5xl md:text-6xl lg:text-7xl text-[var(--brand-accent)]">{page?.heroTitle}</span>
              </h1>
              <p className="body-copy text-xl md:text-2xl text-gray-200">{page?.heroSubtitle}</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mt-16">
            <h2 className="section-title text-4xl md:text-5xl text-center mb-8 text-[var(--brand-accent)]">{page?.heroDescription}</h2>

            <div className="flex flex-wrap justify-center gap-4 mb-12">
              {features.map((feature: any) => {
                return (
                  <div
                    key={feature.title}
                    className="bg-[var(--brand-accent-strong)] backdrop-blur-sm px-6 py-4 rounded-full flex items-center gap-3 border-2 border-[var(--brand-accent)]"
                  >
                    <SiteIcon name={feature.icon} fallback={SparklesIcon} className="w-6 h-6 text-[var(--brand-brown)]" />
                    <div className="text-left">
                      <div className="card-title text-[var(--brand-brown)] text-base">{feature.title}</div>
                      <div className="body-copy text-xs text-[var(--brand-brown-muted)]">{feature.description}</div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
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
                    <div className="relative h-[360px] rounded-[28px] overflow-hidden bg-white shadow-lg transition-all duration-500 border border-[#eadfcb] group-hover:-translate-y-2 group-hover:shadow-2xl">
                      <div className="absolute inset-0">
                        <ImageWithFallback
                          src={service.image}
                          alt={service.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>

                      <div className="absolute inset-0 bg-gradient-to-t from-[#111827]/20 via-transparent to-white/10 group-hover:from-[#102418]/85 group-hover:via-[#102418]/50 group-hover:to-[#102418]/15 transition-colors duration-500" />

                      {service.isEcoFriendly && (
                        <div className="absolute top-5 left-5 z-20 inline-flex items-center gap-2 rounded-full bg-[var(--brand-eco-strong)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-white shadow-lg backdrop-blur-sm">
                          <Leaf className="w-4 h-4" />
                          <span>Green Initiative</span>
                        </div>
                      )}

                      <div className="absolute inset-x-0 bottom-0">
                        <motion.div
                          initial={false}
                          className="relative bg-white/96 backdrop-blur-md shadow-xl overflow-visible"
                        >
                          <div className="absolute -top-7 right-5 w-14 h-14 rounded-full bg-[#FFD24D] border-[5px] border-white shadow-lg flex items-center justify-center z-20 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                            <Icon className="w-6 h-6 text-[#1f2a37]" />
                          </div>

                          <div className="px-6 pt-8 pb-5">
                            <h3 className="card-title pr-14 text-[1.9rem] text-[#0f172a] transition-transform duration-500 group-hover:-translate-y-1">
                              {service.title}
                            </h3>

                            <div className="mt-3 overflow-hidden">
                              <p className="body-copy text-sm text-slate-600 max-h-0 opacity-0 -translate-y-3 transition-all duration-500 group-hover:max-h-40 group-hover:opacity-100 group-hover:translate-y-0">
                                {service.description}
                              </p>
                            </div>
                          </div>
                        </motion.div>
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
        <section className="py-20 bg-[var(--brand-eco)] text-white relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
          </div>

          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
            <div className="flex justify-center mb-6">
              <Leaf className="w-16 h-16 text-[var(--brand-accent)]" />
            </div>
            <h2 className="section-title text-4xl md:text-6xl mb-6">{cta.title}</h2>
            <p className="body-copy text-xl mb-8 text-white/88">{cta.description}</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/get-quote" className="inline-flex items-center justify-center px-10 py-4 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-all transform hover:scale-105 font-semibold shadow-xl">
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
