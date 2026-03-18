import { motion } from 'motion/react';
import { Users, Heart, TrendingUp, Award, CheckCircle, Briefcase } from 'lucide-react';
import { Sparkles } from '../Sparkles';
import { useState } from 'react';

export function JoinTeam() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    availability: '',
    resume: null as File | null,
    coverLetter: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert('Thank you for your application! We will review it and get back to you soon.');
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      position: '',
      experience: '',
      availability: '',
      resume: null,
      coverLetter: '',
    });
  };

  const benefits = [
    {
      icon: Heart,
      title: 'Health Benefits',
      description: 'Comprehensive health, dental, and vision insurance for you and your family.',
    },
    {
      icon: TrendingUp,
      title: 'Career Growth',
      description: 'Opportunities for advancement and professional development programs.',
    },
    {
      icon: Award,
      title: 'Competitive Pay',
      description: 'Above-market wages with performance bonuses and incentives.',
    },
    {
      icon: Users,
      title: 'Team Culture',
      description: 'Supportive work environment with a focus on teamwork and collaboration.',
    },
  ];

  const positions = [
    'Residential Cleaner',
    'Commercial Cleaner',
    'Team Leader',
    'Office Manager',
    'Customer Service Representative',
    'Sales Representative',
  ];

  const perks = [
    'Flexible scheduling',
    'Paid training',
    'Paid time off',
    'Retirement plan (401k)',
    'Employee discounts',
    'Referral bonuses',
    'Professional uniforms provided',
    'Company equipment and supplies',
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
            <h1 className="text-4xl md:text-6xl mb-6">
              Join Our <span className="text-[#F4C430]">Team</span>
            </h1>
            <p className="text-xl text-gray-300">
              Build a rewarding career with a company that values excellence, integrity, and teamwork.
              We're always looking for passionate individuals to join our growing team.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">Why Work With Us?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow"
              >
                <benefit.icon className="w-16 h-16 mx-auto mb-4 text-[#F4C430]" />
                <h3 className="text-xl mb-3">{benefit.title}</h3>
                <p className="text-gray-600 text-sm">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Perks Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl mb-4">Employee Perks & Benefits</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {perks.map((perk, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl flex items-center shadow-md"
              >
                <CheckCircle className="w-6 h-6 text-[#F4C430] mr-3 flex-shrink-0" />
                <span>{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-[#F4C430]" />
            <h2 className="text-4xl mb-4">Apply Now</h2>
            <p className="text-gray-600">
              Fill out the form below to start your application process
            </p>
          </motion.div>
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-6 bg-gray-50 p-8 rounded-2xl"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-gray-700">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
                  placeholder="John"
                />
              </div>
              <div>
                <label className="block mb-2 text-gray-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
                  placeholder="Doe"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            <div>
              <label className="block mb-2 text-gray-700">Position Applied For</label>
              <select
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
              >
                <option value="">Select a position</option>
                {positions.map((position) => (
                  <option key={position} value={position}>
                    {position}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-700">Years of Experience</label>
              <input
                type="text"
                required
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
                placeholder="e.g., 3 years"
              />
            </div>
            <div>
              <label className="block mb-2 text-gray-700">Availability</label>
              <select
                required
                value={formData.availability}
                onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white"
              >
                <option value="">Select availability</option>
                <option value="immediate">Immediate</option>
                <option value="2weeks">2 weeks notice</option>
                <option value="1month">1 month notice</option>
                <option value="flexible">Flexible</option>
              </select>
            </div>
            <div>
              <label className="block mb-2 text-gray-700">Cover Letter</label>
              <textarea
                rows={6}
                value={formData.coverLetter}
                onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#F4C430] bg-white resize-none"
                placeholder="Tell us why you want to join our team..."
              />
            </div>
            <button
              type="submit"
              className="w-full px-8 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105"
            >
              Submit Application
            </button>
          </motion.form>
        </div>
      </section>

      {/* Testimonials */}
      
    </div>
  );
}
