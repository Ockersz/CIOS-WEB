import { motion } from 'motion/react';
import { Briefcase, CheckCircle } from 'lucide-react';
import { Sparkles } from '../Sparkles';
import { useState } from 'react';
import { useCmsPage } from '../../lib/api';
import { iconMap } from '../../lib/iconMap';

export function JoinTeam() {
  const { data: page } = useCmsPage<any>('join-team');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    position: '',
    experience: '',
    availability: '',
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
      coverLetter: '',
    });
  };

  return (
    <div className="w-full">
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32 overflow-hidden">
        <Sparkles count={30} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-6xl mb-6">{page?.heroTitle}</h1>
            <p className="text-xl text-gray-300">{page?.heroSubtitle}</p>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl mb-4">Why Work With Us?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {(page?.content?.benefits || []).map((benefit: any, index: number) => {
              const Icon = iconMap[benefit.icon as keyof typeof iconMap];
              return (
                <motion.div key={benefit.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-gradient-to-br from-gray-50 to-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-shadow">
                  {Icon ? <Icon className="w-16 h-16 mx-auto mb-4 text-[#F4C430]" /> : null}
                  <h3 className="text-xl mb-3">{benefit.title}</h3>
                  <p className="text-gray-600 text-sm">{benefit.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-4xl mb-4">Employee Perks & Benefits</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(page?.content?.perks || []).map((perk: string, index: number) => (
              <motion.div key={perk} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="bg-white p-6 rounded-xl flex items-center shadow-md">
                <CheckCircle className="w-6 h-6 text-[#F4C430] mr-3 flex-shrink-0" />
                <span>{perk}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <Briefcase className="w-16 h-16 mx-auto mb-4 text-[#F4C430]" />
            <h2 className="text-4xl mb-4">Apply Now</h2>
            <p className="text-gray-600">Fill out the form below to start your application process</p>
          </motion.div>
          <motion.form initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} onSubmit={handleSubmit} className="space-y-6 bg-gray-50 p-8 rounded-2xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                ['First Name', 'firstName', 'John'],
                ['Last Name', 'lastName', 'Doe'],
                ['Email', 'email', 'john@example.com'],
                ['Phone', 'phone', '+61 03 8907 1881'],
              ].map(([label, key, placeholder]) => (
                <div key={String(key)}>
                  <label className="block mb-2 text-gray-700">{label}</label>
                  <input
                    type="text"
                    required
                    value={(formData as any)[key]}
                    onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white"
                    placeholder={String(placeholder)}
                  />
                </div>
              ))}
              <div>
                <label className="block mb-2 text-gray-700">Position</label>
                <select value={formData.position} onChange={(e) => setFormData({ ...formData, position: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white">
                  <option value="">Select a position</option>
                  {(page?.content?.positions || []).map((position: string) => (
                    <option key={position} value={position}>{position}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block mb-2 text-gray-700">Experience</label>
                <input type="text" value={formData.experience} onChange={(e) => setFormData({ ...formData, experience: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="3 years" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700">Availability</label>
                <input type="text" value={formData.availability} onChange={(e) => setFormData({ ...formData, availability: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white" placeholder="Immediate / 2 weeks notice" />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-2 text-gray-700">Cover Letter</label>
                <textarea rows={6} value={formData.coverLetter} onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })} className="w-full px-4 py-3 rounded-lg border border-gray-300 bg-white resize-none" placeholder="Tell us about yourself and why you'd like to join CIOS..." />
              </div>
            </div>

            <button type="submit" className="w-full px-8 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105">
              Submit Application
            </button>
          </motion.form>
        </div>
      </section>
    </div>
  );
}
