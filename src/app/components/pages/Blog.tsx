import { motion } from 'motion/react';
import { Calendar, User, ArrowRight, Search } from 'lucide-react';
import { Sparkles } from '../Sparkles';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { useState } from 'react';
import { Navigate } from 'react-router';
import { useBlogPosts, useCmsPage } from '../../lib/api';
import { Seo } from '../Seo';
import { buildPageTitle, trimSeoDescription } from '../../lib/seo';

export function Blog() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { data: page } = useCmsPage('blog');
  const { data: blogPosts } = useBlogPosts();
  const isBlogVisible = page?.content?.isVisible !== false;

  const categories = ['All', ...new Set((blogPosts || []).map((post) => post.category))];

  const filteredPosts = (blogPosts || []).filter((post) => {
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (page && !isBlogVisible) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="w-full">
      <Seo
        title={buildPageTitle('Blog')}
        description={trimSeoDescription(page?.heroSubtitle)}
        path="/blog"
      />
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32 overflow-hidden">
        <Sparkles count={30} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="hero-title text-5xl md:text-7xl mb-6">
              {page?.heroTitle?.split(' ')[0]} <span className="text-[var(--brand-accent)]">{page?.heroTitle?.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="body-copy text-xl text-gray-300 mb-8">{page?.heroSubtitle}</p>
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-6 py-4 pr-12 rounded-full text-gray-900 focus:outline-none focus:ring-2 focus:ring-[var(--brand-accent)]"
              />
              <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full transition-all ${
                  selectedCategory === category
                    ? 'bg-[var(--brand-accent)] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPosts.map((post, index) => (
              <motion.article
                key={post.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all cursor-pointer group"
              >
                <div className="bg-[var(--brand-accent)] h-48 relative overflow-hidden">
                  {post.image ? (
                    <ImageWithFallback
                      src={post.image}
                      alt={post.title}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-black/20" />
                </div>
                <div className="p-6">
                  <div className="text-sm text-[var(--brand-accent)] mb-2">{post.category}</div>
                  <h3 className="card-title text-2xl mb-3 group-hover:text-[var(--brand-accent)] transition-colors">{post.title}</h3>
                  <p className="body-copy text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {post.dateLabel}
                    </div>
                  </div>
                  <div className="text-sm text-gray-500 mb-4">{post.readTime}</div>
                  <button className="inline-flex items-center text-[var(--brand-accent)] hover:text-[var(--brand-accent-hover)] transition-colors group">
                    Read More <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </motion.article>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500 text-xl">No articles found matching your search.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
