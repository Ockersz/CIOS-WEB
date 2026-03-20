import { motion } from 'motion/react';
import { MapPin, Send } from 'lucide-react';
import { Sparkles } from '../Sparkles';
import { SiteIcon } from '../SiteIcon';
import { useState } from 'react';
import { useCmsPage, useSiteSettings } from '../../lib/api';
import { Seo } from '../Seo';
import { buildPageTitle, createFaqStructuredData, createLocalBusinessStructuredData, trimSeoDescription } from '../../lib/seo';

export function Contact() {
  const { data: page } = useCmsPage<any>('contact');
  const { data: settings } = useSiteSettings();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for contacting us! We will get back to you soon.');
    setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <div className="w-full">
      <Seo
        title={buildPageTitle('Contact', settings)}
        description={trimSeoDescription(page?.heroSubtitle || settings?.business?.shortDescription)}
        path="/contact"
        structuredData={[
          createLocalBusinessStructuredData(settings, '/contact'),
          createFaqStructuredData(page?.content?.faqs),
        ].filter(Boolean) as Array<Record<string, unknown>>}
      />
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32 overflow-hidden">
        <Sparkles count={30} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="hero-title text-5xl md:text-7xl mb-6">{page?.heroTitle}</h1>
            <p className="body-copy text-xl text-gray-300">{page?.heroSubtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(settings?.contactCards || []).map((info: any, index: number) => {
              return (
                <motion.div
                  key={info.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow"
                >
                  <SiteIcon name={info.icon} fallback={MapPin} className="w-12 h-12 mx-auto mb-4 text-[var(--brand-accent)]" />
                  <h3 className="card-title text-xl mb-4">{info.title}</h3>
                  {info.details.map((detail: string) => (
                    <p key={detail} className="body-copy text-gray-600 text-sm mb-1">{detail}</p>
                  ))}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="section-title text-4xl md:text-5xl mb-6">Send Us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                {[
                  ['Full Name', 'name', 'John Doe', 'text', true],
                  ['Email Address', 'email', 'john@example.com', 'email', true],
                  ['Phone Number', 'phone', '+61 03 8907 1881', 'tel', false],
                  ['Subject', 'subject', 'How can we help?', 'text', true],
                ].map(([label, key, placeholder, type, required]) => (
                  <div key={String(key)}>
                    <label className="block mb-2 text-gray-700">{label}</label>
                    <input
                      type={String(type)}
                      required={Boolean(required)}
                      value={(formData as any)[key]}
                      onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] bg-white"
                      placeholder={String(placeholder)}
                    />
                  </div>
                ))}
                <div>
                  <label className="block mb-2 text-gray-700">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)] bg-white resize-none"
                    placeholder="Tell us more about your cleaning needs..."
                  />
                </div>
                <button type="submit" className="w-full px-8 py-4 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-all transform hover:scale-105 flex items-center justify-center gap-2">
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="section-title text-4xl md:text-5xl mb-6">{page?.content?.map?.title || 'Find Us'}</h2>
              <div className="bg-gray-300 rounded-2xl h-[500px] flex items-center justify-center">
                <div className="text-center text-gray-600">
                  <MapPin className="w-16 h-16 mx-auto mb-4" />
                  <p>Map Location</p>
                  <p className="text-sm">{settings?.business?.locationLabel || page?.content?.map?.address}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title text-4xl md:text-5xl mb-4">Frequently Asked Questions</h2>
          </motion.div>
          <div className="space-y-6">
            {(page?.content?.faqs || []).map((faq: any, index: number) => (
              <motion.div key={faq.q} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gray-50 p-6 rounded-xl">
                <h3 className="card-title text-xl mb-2">{faq.q}</h3>
                <p className="body-copy text-gray-600">{faq.a}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
