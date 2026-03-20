import { motion } from 'motion/react';
import { Calculator, CheckCircle } from 'lucide-react';
import { Sparkles } from '../Sparkles';
import { useState } from 'react';
import { useCmsPage } from '../../lib/api';
import { Seo } from '../Seo';
import { buildPageTitle, trimSeoDescription } from '../../lib/seo';

export function GetQuote() {
  const { data: page } = useCmsPage<any>('get-quote');
  const [formData, setFormData] = useState({
    serviceType: '',
    propertyType: '',
    squareFeet: '',
    bedrooms: '',
    bathrooms: '',
    frequency: '',
    name: '',
    email: '',
    phone: '',
    address: '',
    additionalInfo: '',
  });
  const [estimatedPrice, setEstimatedPrice] = useState<number | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let basePrice = 99;
    if (formData.serviceType === 'residential') basePrice = 89;
    if (formData.serviceType === 'commercial') basePrice = 149;
    if (formData.serviceType === 'car') basePrice = 79;
    if (formData.serviceType === 'industrial') basePrice = 299;

    const sqftMultiplier = formData.squareFeet ? parseInt(formData.squareFeet) / 1000 : 1;
    const estimated = Math.max(49, Math.round(basePrice * sqftMultiplier));
    setEstimatedPrice(estimated);
    alert(`Thank you! Your estimated quote is $${estimated}. We'll contact you soon with a detailed quote.`);
  };

  return (
    <div className="w-full">
      <Seo
        title={buildPageTitle('Get a Free Quote')}
        description={trimSeoDescription(page?.heroSubtitle)}
        path="/get-quote"
      />
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32 overflow-hidden">
        <Sparkles count={30} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <Calculator className="w-20 h-20 mx-auto mb-6 text-[var(--brand-accent)]" />
            <h1 className="hero-title text-5xl md:text-7xl mb-6">{page?.heroTitle}</h1>
            <p className="body-copy text-xl text-gray-300">{page?.heroSubtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(page?.content?.features || []).map((feature: string, index: number) => (
              <motion.div key={feature} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="flex items-center p-4 bg-gray-50 rounded-xl">
                <CheckCircle className="w-6 h-6 text-[var(--brand-accent)] mr-3 flex-shrink-0" />
                <span className="body-copy">{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onSubmit={handleSubmit} className="space-y-8">
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="card-title text-3xl mb-6">Service Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-gray-700">Service Type</label>
                  <select value={formData.serviceType} onChange={(e) => setFormData({ ...formData, serviceType: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" required>
                    <option value="">Select a service</option>
                    {(page?.content?.serviceTypes || []).map((type: any) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Frequency</label>
                  <select value={formData.frequency} onChange={(e) => setFormData({ ...formData, frequency: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white">
                    <option value="">Select frequency</option>
                    {(page?.content?.frequencies || []).map((frequency: string) => (
                      <option key={frequency} value={frequency}>{frequency}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Approx. Square Feet</label>
                  <input type="number" value={formData.squareFeet} onChange={(e) => setFormData({ ...formData, squareFeet: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="1500" />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Property Type</label>
                  <input type="text" value={formData.propertyType} onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="Office, home, clinic..." />
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="card-title text-3xl mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block mb-2 text-gray-700">Full Name</label>
                  <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="John Doe" />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Email Address</label>
                  <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="john@example.com" />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Phone Number</label>
                  <input type="tel" required value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="+61 03 8907 1881" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-gray-700">Property Address</label>
                  <input type="text" required value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="2 Bryants Road, Dandenong VIC 3175" />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-gray-700">Additional Information (Optional)</label>
                  <textarea rows={4} value={formData.additionalInfo} onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white resize-none" placeholder="Any special requirements or areas of concern..." />
                </div>
              </div>
            </div>

            <button type="submit" className="button-text w-full px-8 py-4 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-all transform hover:scale-105 flex items-center justify-center gap-2">
              <Calculator className="w-5 h-5" />
              Get My Free Quote
            </button>
          </motion.form>

          {estimatedPrice && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="mt-8 p-8 bg-[var(--brand-accent)] rounded-2xl text-center text-black">
              <h3 className="card-title text-3xl mb-2">Estimated Quote</h3>
              <div className="stat-number text-6xl mb-4">${estimatedPrice}</div>
              <p className="body-copy text-sm">*This is an estimate. Final pricing may vary based on specific requirements.</p>
            </motion.div>
          )}
        </div>
      </section>

      <section className="py-20 bg-[var(--brand-brown)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title text-4xl md:text-5xl mb-4">What Happens Next?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(page?.content?.nextSteps || []).map((step: any, index: number) => (
              <motion.div key={step.step} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-center">
                <div className="w-16 h-16 bg-[var(--brand-accent)] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-black">
                  {step.step}
                </div>
                <h3 className="card-title text-xl mb-3">{step.title}</h3>
                <p className="body-copy text-gray-300">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
