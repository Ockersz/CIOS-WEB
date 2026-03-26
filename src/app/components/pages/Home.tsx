import { lazy, Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { motion } from "motion/react";
import { Link } from "react-router";
import { Sparkles } from "../Sparkles";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { SiteIcon } from "../SiteIcon";
import {
  Award,
  Building,
  Building2,
  CheckCircle,
  ChevronRight,
  Handshake,
  Heart,
  Phone,
  Shield,
  ShieldCheck,
  Sparkles as SparklesIcon,
  Star,
  TrendingUp,
  UserPlus,
  Users,
} from "lucide-react";
import heroBackgroundImage from "../../../assets/7ca8818179e3f3b71f754641ebc815ec081dd833.webp";
import { useBlogPosts, useCmsPage, useSiteSettings } from "../../lib/api";
import { normalizeHomeBeforeAfterSection } from "../../lib/homeContent";
import { Seo } from "../Seo";
import { buildPageTitle, createLocalBusinessStructuredData, trimSeoDescription } from "../../lib/seo";

const LazyServiceSelector = lazy(() =>
  import("../ServiceSelector").then((module) => ({ default: module.ServiceSelector })),
);
const LazyBeforeAfter = lazy(() =>
  import("../BeforeAfter").then((module) => ({ default: module.BeforeAfter })),
);

function DeferredSection({
  children,
  minHeight,
}: {
  children: ReactNode;
  minHeight: number;
}) {
  const [isReady, setIsReady] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isReady) return;

    const container = containerRef.current;
    if (!container || typeof IntersectionObserver === "undefined") {
      setIsReady(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setIsReady(true);
          observer.disconnect();
        }
      },
      { rootMargin: "320px 0px" },
    );

    observer.observe(container);
    return () => observer.disconnect();
  }, [isReady]);

  return (
    <div ref={containerRef}>
      {isReady ? <Suspense fallback={<div style={{ minHeight }} aria-hidden="true" />}>{children}</Suspense> : <div style={{ minHeight }} aria-hidden="true" />}
    </div>
  );
}

export function Home() {
  const { data: page } = useCmsPage<any>("home");
  const { data: blogPage } = useCmsPage("blog");
  const { data: blogPosts } = useBlogPosts();
  const { data: settings } = useSiteSettings();
  const business = settings?.business;

  const stats = page?.content?.stats || [];
  const aboutSection = page?.content?.aboutSection;
  const testimonials = page?.content?.testimonials || [];
  const clientsSection = settings?.clients;
  const certificationsSection = settings?.accreditations;
  const careersSection = page?.content?.careersSection;
  const previewPosts = (blogPosts || []).slice(0, 3);
  const heroImage = page?.content?.heroImage || heroBackgroundImage;
  const beforeAfterSection = normalizeHomeBeforeAfterSection(page?.content?.beforeAfterSection);
  const isBlogVisible = blogPage?.content?.isVisible !== false;
  const seoDescription = trimSeoDescription(page?.heroSubtitle || business?.shortDescription);

  return (
    <div className="w-full">
      <Seo
        title={buildPageTitle("Professional Cleaning Services in Dandenong", settings)}
        description={seoDescription}
        path="/"
        image={heroImage}
        structuredData={createLocalBusinessStructuredData(settings, "/")}
      />
      <section className="relative bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-100">
          <ImageWithFallback
            src={heroImage}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover"
            loading="eager"
            fetchPriority="high"
          />
        </div>
        <div className="absolute inset-0 bg-[var(--brand-brown-overlay)] z-[1]" />
        <Sparkles count={30} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <h1 className="hero-title text-5xl md:text-6xl lg:text-7xl mb-6">{page?.heroTitle}</h1>
              <p className="body-copy text-lg md:text-xl mb-8 text-gray-300">{page?.heroSubtitle}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/get-quote" className="button-text px-8 py-4 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-all transform hover:scale-105 text-center">
                  Enquire About Free Service
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat: any, index: number) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <div className="stat-number text-5xl md:text-6xl text-[var(--brand-accent)] mb-2">{stat.number}</div>
                <div className="body-copy text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {aboutSection && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="relative h-[600px]">
                  {aboutSection.collageImages?.map((image: any, index: number) => {
                    const positions = [
                      "absolute top-0 left-0 w-[48%] h-[38%]",
                      "absolute top-[12%] right-0 w-[45%] h-[35%] z-10",
                      "absolute bottom-[15%] left-[8%] w-[38%] h-[36%]",
                      "absolute bottom-0 right-[5%] w-[48%] h-[42%] z-10",
                    ];
                    return (
                      <motion.div
                        key={image.alt}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * (index + 1) }}
                        className={positions[index]}
                      >
                        <ImageWithFallback src={image.src} alt={image.alt} className="w-full h-full object-cover rounded-2xl shadow-lg" />
                      </motion.div>
                    );
                  })}
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -bottom-6 -left-6 bg-[var(--brand-accent)] text-black px-8 py-6 rounded-2xl shadow-2xl z-20"
                >
                  <div className="stat-number text-6xl text-center">{aboutSection.experienceBadge}</div>
                  <div className="text-sm text-center font-medium">{aboutSection.experienceLabel}</div>
                </motion.div>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-2 mb-4">
                  <SparklesIcon className="w-5 h-5 text-[var(--brand-accent)]" />
                  <span className="eyebrow-label text-[#6B7280]">{aboutSection.eyebrow}</span>
                </div>

                <h2 className="section-title text-4xl md:text-6xl mb-6 text-gray-900">{aboutSection.title}</h2>

                {aboutSection.paragraphs?.map((paragraph: string) => (
                  <p key={paragraph} className="body-copy text-gray-600 mb-4">{paragraph}</p>
                ))}

                <div className="space-y-4 mb-8">
                  {aboutSection.bullets?.map((bullet: string) => (
                    <div key={bullet} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-full bg-[var(--brand-accent)] flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-black" />
                      </div>
                      <span className="text-gray-700">{bullet}</span>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <Link to="/get-quote" className="button-text px-8 py-4 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-colors text-center">
                    Enquire Now
                  </Link>
                  {business?.phoneDisplay && (
                    <a href={business.phoneHref} className="px-8 py-4 bg-white border-2 border-gray-300 text-gray-900 rounded-full hover:border-[var(--brand-accent)] transition-colors font-medium text-center flex items-center justify-center gap-3">
                      <Phone className="w-5 h-5" />
                      <div className="text-left">
                        <div className="text-xs text-gray-500">Call Us</div>
                        <div className="text-sm font-semibold">{business.phoneDisplay}</div>
                      </div>
                    </a>
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </section>
      )}

      <DeferredSection minHeight={780}>
        <LazyServiceSelector />
      </DeferredSection>

      <DeferredSection minHeight={760}>
        <LazyBeforeAfter section={beforeAfterSection} />
      </DeferredSection>

      <section className="py-20 bg-[var(--brand-brown)] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="section-title text-4xl md:text-5xl mb-4">{page?.content?.testimonialsTitle}</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white text-gray-900 p-8 rounded-2xl shadow-xl"
              >
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-[var(--brand-accent)] text-[var(--brand-accent)]" />
                  ))}
                </div>
                <p className="body-copy text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  {testimonial.logo ? (
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl border border-gray-200 bg-white p-2">
                      <ImageWithFallback
                        src={testimonial.logo}
                        alt={testimonial.logoAlt || testimonial.role || testimonial.name || "Company logo"}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  ) : null}
                  <div className="min-w-0">
                    <div className="text-lg">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {clientsSection && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Handshake className="w-6 h-6 text-[var(--brand-accent)]" />
                <span className="eyebrow-label text-[#6B7280]">{clientsSection.eyebrow}</span>
              </div>
              <h2 className="section-title text-4xl md:text-6xl mb-4 text-gray-900">{clientsSection.title}</h2>
              <p className="body-copy text-gray-600 max-w-2xl mx-auto">{clientsSection.description}</p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {clientsSection.items?.map((client: any, index: number) => (
                (() => {
                  const Icon = index % 2 === 0 ? Building : Building2;
                  const clientName = typeof client === "string" ? client : client?.name || "";
                  const clientLogo = typeof client === "string" ? "" : client?.logo || "";
                  return (
                    <motion.div
                      key={clientName || `client-${index}`}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.05 }}
                        className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 rounded-xl p-6 hover:border-[var(--brand-accent)] hover:shadow-lg transition-all group"
                    >
                      <div className="flex flex-col items-center justify-center text-center h-full">
                        <div className="w-14 h-14 rounded-2xl bg-white border border-gray-200 flex items-center justify-center mb-3 overflow-hidden">
                          {clientLogo ? (
                            <ImageWithFallback src={clientLogo} alt={clientName} className="w-full h-full object-contain" />
                          ) : (
                            <Icon className="w-10 h-10 text-gray-400 group-hover:text-[var(--brand-accent)] transition-colors" />
                          )}
                        </div>
                        <span className="text-gray-700 font-medium text-sm">{clientName}</span>
                      </div>
                    </motion.div>
                  );
                })()
              ))}
            </div>
          </div>
        </section>
      )}

      {certificationsSection && (
        <section className="py-20 bg-[var(--brand-brown)] text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Award className="w-6 h-6 text-[var(--brand-accent)]" />
                <span className="eyebrow-label text-gray-300">{certificationsSection.eyebrow}</span>
              </div>
              <h2 className="section-title text-4xl md:text-6xl mb-4">{certificationsSection.title}</h2>
              <p className="body-copy text-gray-300 max-w-2xl mx-auto">{certificationsSection.description}</p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {certificationsSection.groups?.map((group: any, index: number) => {
                return (
                  <motion.div
                    key={group.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-12 h-12 bg-[var(--brand-accent)] rounded-xl flex items-center justify-center">
                        <SiteIcon name={group.icon} fallback={Shield} className="w-6 h-6 text-black" />
                      </div>
                      <h3 className="text-2xl font-bold">{group.title}</h3>
                    </div>
                    <div className="space-y-4">
                      {group.items?.map((item: string) => (
                        <div key={item} className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-[var(--brand-accent)] flex-shrink-0 mt-0.5" />
                          <span className="text-gray-300">{item}</span>
                        </div>
                      ))}
                      {group.memberships?.map((item: any) => (
                        <div key={item.name} className="flex items-start gap-3">
                          <Award className="w-5 h-5 text-[var(--brand-accent)] flex-shrink-0 mt-0.5" />
                          <div>
                            <div className="text-white font-semibold">{item.name}</div>
                            <div className="text-gray-400 text-sm">{item.full}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {isBlogVisible && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
              <h2 className="section-title text-4xl md:text-5xl mb-4">Explore Our Cleaning Blog</h2>
            </motion.div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {previewPosts.map((post) => (
                <motion.div key={post.slug} className="bg-gray-50 rounded-2xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
                  <div className="bg-gray-200 h-48 relative overflow-hidden">
                    {post.image ? (
                      <ImageWithFallback
                        src={post.image}
                        alt={post.title}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="p-6">
                    <div className="text-sm text-[var(--brand-accent)] mb-2">{post.category}</div>
                    <h3 className="text-xl mb-2">{post.title}</h3>
                    <div className="text-sm text-gray-500">{post.dateLabel}</div>
                  </div>
                </motion.div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link to="/blog" className="inline-flex items-center px-6 py-3 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-colors">
                View All Posts <ChevronRight className="ml-2" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {careersSection && (
        <section className="py-20 bg-[var(--brand-brown)] text-white relative overflow-hidden">
          <Sparkles count={20} />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
                <div className="flex items-center gap-2 mb-4">
                  <UserPlus className="w-5 h-5 text-[var(--brand-accent)]" />
                  <span className="eyebrow-label text-gray-300">{careersSection.eyebrow}</span>
                </div>

                <h2 className="section-title text-4xl md:text-6xl mb-6">{careersSection.title}</h2>
                <p className="body-copy text-gray-300 mb-8 text-lg">{careersSection.description}</p>

                <div className="space-y-4 mb-8">
                  {careersSection.benefits?.map((benefit: any) => {
                    return (
                      <div key={benefit.title} className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--brand-accent-soft)] flex items-center justify-center flex-shrink-0">
                          <SiteIcon name={benefit.icon} fallback={Heart} className="w-5 h-5 text-[var(--brand-accent)]" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-white mb-1">{benefit.title}</h3>
                          <p className="text-gray-400 text-sm">{benefit.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <Link to="/join-team" className="button-text inline-flex items-center px-8 py-4 bg-[var(--brand-accent)] text-black rounded-full hover:bg-[var(--brand-accent-hover)] transition-all transform hover:scale-105">
                  {careersSection.ctaLabel} <ChevronRight className="ml-2" />
                </Link>
              </motion.div>

              <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} className="relative">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <ImageWithFallback src={careersSection.images?.[0]?.src} alt={careersSection.images?.[0]?.alt} className="w-full h-48 object-cover rounded-2xl shadow-lg" />
                    <ImageWithFallback src={careersSection.images?.[1]?.src} alt={careersSection.images?.[1]?.alt} className="w-full h-64 object-cover rounded-2xl shadow-lg" />
                  </div>
                  <div className="space-y-4 pt-8">
                    <ImageWithFallback src={careersSection.images?.[2]?.src} alt={careersSection.images?.[2]?.alt} className="w-full h-64 object-cover rounded-2xl shadow-lg" />
                    <ImageWithFallback src={careersSection.images?.[3]?.src} alt={careersSection.images?.[3]?.alt} className="w-full h-48 object-cover rounded-2xl shadow-lg" />
                  </div>
                </div>

                <motion.div
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3, type: "spring" }}
                  className="absolute -bottom-6 -left-6 bg-[var(--brand-accent)] text-black px-8 py-6 rounded-2xl shadow-2xl"
                >
                  <div className="stat-number text-6xl text-center">{careersSection.staffCount}</div>
                  <div className="text-sm text-center font-medium">{careersSection.staffLabel}</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
