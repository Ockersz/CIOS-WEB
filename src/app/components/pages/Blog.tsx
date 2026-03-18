import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Sparkles } from '../Sparkles';
import { useState } from 'react';

export function Blog() {
  const [searchQuery, setSearchQuery] = useState('');

  const blogPosts = [
    {
      title: '10 Tips for Maintaining a Clean Home Year-Round',
      excerpt:
        'Discover practical strategies to keep your home spotless throughout the year with minimal effort.',
      category: 'Home Tips',
      date: 'March 15, 2026',
      author: 'Sarah Johnson',
      readTime: '5 min read',
    },
    {
      title: 'The Benefits of Professional Office Cleaning',
      excerpt:
        'Learn how professional cleaning services can boost productivity and create a healthier workplace.',
      category: 'Business',
      date: 'March 12, 2026',
      author: 'Michael Chen',
      readTime: '7 min read',
    },
    {
      title: 'Eco-Friendly Cleaning: Why It Matters',
      excerpt:
        'Explore the importance of using environmentally friendly cleaning products and methods.',
      category: 'Green Living',
      date: 'March 10, 2026',
      author: 'Emily Davis',
      readTime: '6 min read',
    },
    {
      title: 'Spring Cleaning Checklist: Room by Room Guide',
      excerpt:
        'A comprehensive checklist to help you tackle spring cleaning efficiently and effectively.',
      category: 'Seasonal',
      date: 'March 8, 2026',
      author: 'Sarah Johnson',
      readTime: '10 min read',
    },
    {
      title: 'How to Remove Tough Stains from Carpets',
      excerpt:
        'Expert tips and techniques for removing common carpet stains without damaging the fibers.',
      category: 'Tips & Tricks',
      date: 'March 5, 2026',
      author: 'John Smith',
      readTime: '8 min read',
    },
    {
      title: 'The Complete Guide to Car Interior Detailing',
      excerpt:
        'Everything you need to know about keeping your car interior clean and well-maintained.',
      category: 'Auto Care',
      date: 'March 3, 2026',
      author: 'Michael Chen',
      readTime: '12 min read',
    },
    {
      title: 'Organizing Your Home: A Step-by-Step Approach',
      excerpt:
        'Learn how to declutter and organize your space for better efficiency and peace of mind.',
      category: 'Organization',
      date: 'March 1, 2026',
      author: 'Emily Davis',
      readTime: '9 min read',
    },
    {
      title: 'Commercial Kitchen Cleaning Best Practices',
      excerpt:
        'Essential guidelines for maintaining hygiene and safety in commercial kitchen environments.',
      category: 'Commercial',
      date: 'February 28, 2026',
      author: 'John Smith',
      readTime: '11 min read',
    },
    {
      title: 'The Science Behind Effective Disinfection',
      excerpt:
        'Understanding the science that makes professional disinfection services so effective.',
      category: 'Health & Safety',
      date: 'February 25, 2026',
      author: 'Sarah Johnson',
      readTime: '7 min read',
    },
  ];

  const categories = [
    'All',
    'Home Tips',
    'Business',
    'Green Living',
    'Seasonal',
    'Tips & Tricks',
    'Auto Care',
  ];

  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredPosts = blogPosts.filter((post) => {
    const matchesCategory =
      selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
              Our <span className="text-[#F4C430]">Blog</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8">
              Expert tips, advice, and insights on keeping your spaces clean and healthy.
            </p>
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-[#F4C430] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="bg-gradient-to-br from-[#F4C430] to-[#e5b520] h-48 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-0 bg-black/20"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-[#F4C430] mb-2">{post.category}</div>
                  <h3 className="text-xl mb-3 group-hover:text-[#F4C430] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {post.date}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">{post.readTime}</div>
                  <button className="inline-flex items-center text-[#F4C430] hover:text-[#e5b520] transition-colors group">
                    Read More{' '}
                    <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">
                No articles found matching your search.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-br from-[#3D1810] to-[#2a1410] text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl mb-4">Stay Updated</h2>
            <p className="text-xl text-gray-300 mb-8">
              Subscribe to our newsletter for the latest cleaning tips and special offers.
            </p>
            <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-3 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#F4C430]"
              />
              <button
                type="submit"
                className="px-8 py-3 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-colors"
              >
                Subscribe
              </button>
            </form>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
