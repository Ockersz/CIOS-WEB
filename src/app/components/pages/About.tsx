import image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246 from '../../../assets/8fea4c5ef9eb269dfb675b419c51c4d62a3cb246.png';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import { Award, CheckCircle, ChevronRight, Phone, Sparkles as SparklesIcon } from 'lucide-react';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useCmsPage, useSiteSettings } from '../../lib/api';
import { iconMap } from '../../lib/iconMap';

export function About() {
  const { data: page } = useCmsPage<any>('about');
  const { data: settings } = useSiteSettings();
  const business = settings?.business;
  const content = page?.content || {};

  return (
    <div className="w-full">
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#3D1810] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-8">
              <img src={image_8fea4c5ef9eb269dfb675b419c51c4d62a3cb246} alt="CIOS" className="w-32 h-32 object-contain" />
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About <span className="text-[#F4C430]">CIOS</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-4">{page?.heroSubtitle}</p>
            <p className="text-lg text-gray-300">{page?.heroDescription}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {(content.stats || []).map((stat: any, index: number) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center">
                <div className="text-4xl md:text-5xl text-[#F4C430] font-bold mb-2">{stat.number}</div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="flex items-center gap-2 mb-4">
                <SparklesIcon className="w-5 h-5 text-[#F4C430]" />
                <span className="text-gray-600 uppercase tracking-wide text-sm font-medium">{content.story?.eyebrow}</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">{content.story?.title}</h2>
              {content.story?.paragraphs?.map((paragraph: string) => (
                <p key={paragraph} className="text-gray-700 leading-relaxed mb-4">{paragraph}</p>
              ))}

              <div className="space-y-3 mb-8">
                {content.story?.bullets?.map((item: string) => (
                  <div key={item} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-[#F4C430] flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-black" />
                    </div>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <div className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#F4C430]">
                <ImageWithFallback src={content.story?.image} alt="CIOS Cleaning Team at Work" className="w-full h-[500px] object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-900">{content.valuesHeading}</h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">{content.valuesDescription}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(content.values || []).map((value: any, index: number) => {
              const Icon = iconMap[value.icon as keyof typeof iconMap];
              return (
                <motion.div key={value.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-all border-2 border-gray-200 group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-[#F4C430] rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    {Icon ? <Icon className="w-8 h-8 text-black" /> : null}
                  </div>
                  <h3 className="text-2xl font-bold mb-3 text-gray-900">{value.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">{content.whyChooseUsHeading}</h2>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto">{content.whyChooseUsDescription}</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(content.whyChooseUs || []).map((item: any, index: number) => {
              const Icon = iconMap[item.icon as keyof typeof iconMap];
              return (
                <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                  <div className="w-12 h-12 mb-4 bg-[#F4C430] rounded-xl flex items-center justify-center">
                    {Icon ? <Icon className="w-6 h-6 text-black" /> : null}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                  <p className="text-gray-300 leading-relaxed">{item.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {content.cta && (
        <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">{content.cta.title}</h2>
              <p className="text-xl text-gray-300 mb-8">{content.cta.description}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/get-quote" className="inline-flex items-center justify-center px-10 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-semibold shadow-xl">
                  {content.cta.primaryLabel}
                  <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
                {business?.phoneDisplay && (
                  <a href={business.phoneHref} className="inline-flex items-center justify-center px-10 py-4 bg-white/10 border-2 border-white/30 text-white rounded-full hover:bg-white/20 transition-all font-semibold backdrop-blur-sm">
                    <Phone className="mr-2 w-5 h-5" />
                    {content.cta.secondaryLabel}
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
