import { motion } from 'motion/react';
import { Calculator, Home, Building2, Car, Clock, CheckCircle } from 'lucide-react';
import { Sparkles } from '../Sparkles';
import { useState } from 'react';

export function GetQuote() {
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

    let basePrice = 0;
    switch (formData.serviceType) {
      case 'residential':
        basePrice = 89;
        break;
      case 'commercial':
        basePrice = 149;
        break;
      case 'car':
        basePrice = 79;
        break;
      case 'industrial':
        basePrice = 299;
        break;
      default:
        basePrice = 99;
    }

    const sqftMultiplier = formData.squareFeet ? parseInt(formData.squareFeet) / 1000 : 1;
    const estimated = Math.round(basePrice * sqftMultiplier);

    setEstimatedPrice(estimated);
    alert(`Thank you! Your estimated quote is $${estimated}. We'll contact you soon with a detailed quote.`);
  };

  const serviceTypes = [
    { value: 'residential', label: 'Residential Cleaning', icon: Home },
    { value: 'commercial', label: 'Commercial Cleaning', icon: Building2 },
    { value: 'car', label: 'Car Detailing', icon: Car },
    { value: 'industrial', label: 'Industrial Cleaning', icon: Building2 },
  ];

  const frequencies = [
    'One-time Service',
    'Weekly',
    'Bi-weekly',
    'Monthly',
    'Quarterly',
  ];

  const features = [
    'Free in-home estimate',
    'No obligation quote',
    'Customized cleaning plan',
    'Flexible scheduling',
    'Satisfaction guarantee',
    'Eco-friendly options',
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32 overflow-hidden">
        <Sparkles count={30} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <Calculator className="w-20 h-20 mx-auto mb-6 text-[#F4C430]" />
            <h1 className="text-4xl md:text-6xl mb-6">
              Get a <span className="text-[#F4C430]">Free Quote</span>
            </h1>
            <p className="text-xl text-gray-300">
              Tell us about your cleaning needs and get an instant estimate. No obligation, completely
              free!
            </p>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center p-4 bg-gray-50 rounded-xl"
              >
                <CheckCircle className="w-6 h-6 text-[#F4C430] mr-3 flex-shrink-0" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Service Type Selection */}
      

      {/* Quote Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-8"
          >
            {/* Property Details */}
            

            {/* Contact Information */}
            <div className="bg-gray-50 p-8 rounded-2xl">
              <h3 className="text-2xl mb-6">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block mb-2 text-gray-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
                    placeholder="john@example.com"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-gray-700">Property Address</label>
                  <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
                    placeholder="123 Main St, City, State 12345"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block mb-2 text-gray-700">
                    Additional Information (Optional)
                  </label>
                  <textarea
                    rows={4}
                    value={formData.additionalInfo}
                    onChange={(e) =>
                      setFormData({ ...formData, additionalInfo: e.target.value })
                    }
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white resize-none"
                    placeholder="Any special requirements or areas of concern..."
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-8 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Calculator className="w-5 h-5" />
              Get My Free Quote
            </button>
          </motion.form>

          {estimatedPrice && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-8 p-8 bg-gradient-to-r from-[#F4C430] to-[#e5b520] rounded-2xl text-center text-black"
            >
              <h3 className="text-2xl mb-2">Estimated Quote</h3>
              <div className="text-5xl mb-4">${estimatedPrice}</div>
              <p className="text-sm">
                *This is an estimate. Final pricing may vary based on specific requirements.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">What Happens Next?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-center"
            >
              <div className="w-16 h-16 bg-[#F4C430] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-black">
                1
              </div>
              <h3 className="text-xl mb-3">We Review Your Request</h3>
              <p className="text-gray-300">
                Our team reviews your quote request and assesses your specific needs.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-center"
            >
              <div className="w-16 h-16 bg-[#F4C430] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-black">
                2
              </div>
              <h3 className="text-xl mb-3">We Contact You</h3>
              <p className="text-gray-300">
                We'll reach out within 24 hours to discuss your requirements and schedule a visit.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl text-center"
            >
              <div className="w-16 h-16 bg-[#F4C430] rounded-full flex items-center justify-center mx-auto mb-4 text-2xl text-black">
                3
              </div>
              <h3 className="text-xl mb-3">Service Delivered</h3>
              <p className="text-gray-300">
                Our professional team arrives on schedule and delivers exceptional cleaning service.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
