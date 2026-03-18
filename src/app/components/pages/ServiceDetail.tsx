import { ImageWithFallback } from '../figma/ImageWithFallback';
import { ChevronRight, Leaf, Recycle, Droplets, Shield, CheckCircle } from 'lucide-react';
import { useParams, Link } from 'react-router';
import { motion } from 'motion/react';
import ciosLogo from '../../../imports/cioslogo.svg';

interface ServiceContent {
  id: string;
  title: string;
  heroImage: string;
  description: string;
  detailImage: string;
  isEcoFriendly?: boolean;
  services: {
    title: string;
    description: string;
  }[];
}

const serviceData: Record<string, ServiceContent> = {
  'commercial': {
    id: 'commercial',
    title: 'Commercial & Industrial Cleaning',
    heroImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1920',
    description: 'We offer a comprehensive range of cleaning services tailored to meet both regular maintenance needs and specialized tasks like carpet and window cleaning. With years of experience, our team delivers reliable service that aligns with your requirements and budget, whether it is a one-time job or a recurring arrangement. Our eco-friendly cleaning solutions protect both your facility and the environment.',
    detailImage: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
    isEcoFriendly: true,
    services: [
      {
        title: 'Cleaning of Commercial and Industrial Facilities',
        description: 'We handle the scheduling of regular services as well as periodic cleaning for office, shopping centers and factories as required. We also handle tasks of a more specialized nature such as carpet and window cleaning. We arrange to visit your premises to discuss your requirements and individual pricing is tailored to suit your budget.'
      },
      {
        title: 'Window Cleaning',
        description: 'We offer professional window cleaning services that go beyond just creating a cleaner, brighter environment for your building and its occupants. We are adaptable, we can handle the scope and dynamic of your task on a weekly, fortnightly, monthly or as you require.'
      },
      {
        title: 'Floor Cleaning',
        description: 'Our floor cleaning services cover a variety of surfaces from carpets to tiles, providing deep cleans to surface cleaning. We use the latest equipment and eco-friendly techniques to preserve and clean all types of flooring, protecting their integrity and ensuring sanitization.'
      },
      {
        title: 'Washroom/Restroom Scheduling',
        description: 'We pride you on comprehensive facility management services. We offer comprehensive facility management services that can include scheduled refilling of consumables (such as toilet paper, soaps, paper towels etc.). We can provide initial equipment installation or replacement, ensuring an uninterrupted supply of consumables.'
      },
      {
        title: 'Pressure Washing',
        description: 'Using powerful jet stream, we can achieve exterior surfaces cleaning rich results, from walls to floors, driveways, pathways and concrete surfaces. Pressure washing is best for large sized cleaning tasks that need intensive cleaning.'
      },
      {
        title: 'Sanitation Cleaning',
        description: 'This covers a comprehensive approach from disinfecting high touch points according to the needs of your business and industry standards. We have experience in clinical and medical facility cleaning and ensure compliance with health regulations.'
      },
      {
        title: 'Waste Management',
        description: 'General waste handling services are supplied and we ensure proper waste management with full compliance. We provide bulk waste pick up for any disposal, cleaning or recycling solution. It allows for your organization to focus on your business.'
      },
      {
        title: 'Hygiene & Sanitary Services',
        description: 'We have worked with manufacturers, government facilities (agencies), universities and airports. Sensitive areas also receive continuous monitoring and cleaning as well as providing health safety and sanitization solutions to keep working areas healthy and safe. Our areas of service, sanitize, air fresheners, and hygiene desk stations are covered; we will come to you.'
      },
      {
        title: 'Washroom Consumables & Replenishment',
        description: 'We supply and manage eco-safe supplies including, toilet seat covers, paper towel, disposables and air spray and refreshers. We ensure timely replacement for odor control, supplies management.'
      },
      {
        title: 'Waste Management & Recycling',
        description: 'We offer convenient and sustainable municipal and commercial cleaning services. With our eco-friendly disposal and recycling services, take up segregation through our service that provides scheduled and timely pickup and disposal, which allows clients to comply with environmental regulations and comply with modern waste protocols and sustainability standards.'
      }
    ]
  },
  'educational': {
    id: 'educational',
    title: 'Educational Cleaning',
    heroImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=1920',
    description: 'For educational institutions, maintaining a clean and hygienic environment is crucial. Our school and university cleaning services are specially designed to foster a safe and healthy atmosphere for students, teachers, and staff. From daily cleaning tasks to comprehensive cleaning solutions tailored to meet the unique needs of each school. We use eco-friendly products safe for children.',
    detailImage: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800',
    isEcoFriendly: true,
    services: [
      {
        title: 'Classroom Cleaning',
        description: 'Daily cleaning and sanitization of classrooms, desks, and learning areas to maintain a healthy educational environment.'
      },
      {
        title: 'Cafeteria & Kitchen Cleaning',
        description: 'Deep cleaning and sanitization of food preparation and dining areas to meet health and safety standards.'
      },
      {
        title: 'Gymnasium & Sports Facilities',
        description: 'Specialized cleaning for sports equipment, locker rooms, and athletic facilities.'
      },
      {
        title: 'Library & Study Areas',
        description: 'Careful cleaning of learning spaces, book shelves, and study areas with minimal disruption.'
      }
    ]
  },
  'medical': {
    id: 'medical',
    title: 'Medical Facility Cleaning',
    heroImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920',
    description: 'Healthcare facilities require the highest standards of cleanliness and infection control. Our medical facility cleaning services are designed to meet strict healthcare regulations while ensuring patient safety and comfort. We combine hospital-grade sanitation with environmentally conscious practices.',
    detailImage: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800',
    isEcoFriendly: true,
    services: [
      {
        title: 'Patient Room Sanitization',
        description: 'Thorough cleaning and disinfection of patient rooms, ensuring compliance with healthcare standards.'
      },
      {
        title: 'Operating Theatre Cleaning',
        description: 'Specialized cleaning protocols for surgical areas with strict sterile environment requirements.'
      },
      {
        title: 'Infection Control Protocols',
        description: 'Implementation of rigorous infection prevention measures and cleaning procedures.'
      },
      {
        title: 'Medical Waste Management',
        description: 'Proper handling and disposal of medical waste in compliance with healthcare regulations.'
      }
    ]
  },
  'transport': {
    id: 'transport',
    title: 'Transport Cleaning',
    heroImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1920',
    description: 'Keep your fleet clean and presentable with our comprehensive transport cleaning services. We handle buses, trains, trams, and other public and commercial vehicles with specialized cleaning techniques. Our green cleaning methods ensure passenger safety while protecting the environment.',
    detailImage: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=800',
    isEcoFriendly: true,
    services: [
      {
        title: 'Interior Vehicle Cleaning',
        description: 'Complete interior cleaning including seats, floors, windows, and handrails.'
      },
      {
        title: 'Exterior Washing',
        description: 'Professional washing and detailing of vehicle exteriors for a polished appearance.'
      },
      {
        title: 'Sanitization Services',
        description: 'Regular sanitization of high-touch surfaces to ensure passenger safety.'
      },
      {
        title: 'Deep Cleaning & Detailing',
        description: 'Comprehensive deep cleaning services for vehicles requiring intensive maintenance.'
      }
    ]
  },
  'infection-control': {
    id: 'infection-control',
    title: 'Infection Control',
    heroImage: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=1920',
    description: 'Our infection control services provide comprehensive cleaning and disinfection solutions to prevent the spread of harmful pathogens in any environment. We use environmentally responsible disinfectants that are tough on germs but safe for people and the planet.',
    detailImage: 'https://images.unsplash.com/photo-1584744982491-665216d95f8b?w=800',
    isEcoFriendly: true,
    services: [
      {
        title: 'High-Touch Surface Disinfection',
        description: 'Regular disinfection of frequently touched surfaces to minimize infection risk.'
      },
      {
        title: 'Outbreak Response Cleaning',
        description: 'Rapid response cleaning services for infection outbreak situations.'
      },
      {
        title: 'Healthcare-Grade Sanitization',
        description: 'Hospital-grade cleaning protocols for clinical and non-clinical environments.'
      },
      {
        title: 'Staff Training & Compliance',
        description: 'Training programs to ensure staff follow proper infection control procedures.'
      }
    ]
  },
  'landscaping': {
    id: 'landscaping',
    title: 'Landscaping',
    heroImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=1920',
    description: 'Professional landscaping services to maintain beautiful, well-kept outdoor spaces for commercial and residential properties. We employ sustainable practices that nurture nature while creating stunning landscapes that respect our environment.',
    detailImage: 'https://images.unsplash.com/photo-1558904541-efa843a96f01?w=800',
    isEcoFriendly: true,
    services: [
      {
        title: 'Lawn Maintenance',
        description: 'Regular mowing, edging, and lawn care to keep green spaces pristine.'
      },
      {
        title: 'Garden Bed Maintenance',
        description: 'Weeding, mulching, and plant care for garden areas.'
      },
      {
        title: 'Outdoor Area Cleaning',
        description: 'Cleaning of pathways, patios, and outdoor common areas.'
      },
      {
        title: 'Seasonal Services',
        description: 'Seasonal landscaping tasks including leaf removal and seasonal planting.'
      }
    ]
  },
  'residential': {
    id: 'residential',
    title: 'Residential & Car Cleaning',
    heroImage: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=1920',
    description: 'Complete residential cleaning services including home cleaning and vehicle detailing to keep your personal spaces spotless. We use eco-friendly products that are safe for your family, pets, and the environment.',
    detailImage: 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=800',
    isEcoFriendly: true,
    services: [
      {
        title: 'Home Deep Cleaning',
        description: 'Thorough cleaning of all rooms including kitchens, bathrooms, bedrooms, and living areas.'
      },
      {
        title: 'Regular Maintenance Cleaning',
        description: 'Scheduled cleaning services to maintain your home on a weekly, fortnightly, or monthly basis.'
      },
      {
        title: 'Car Interior Detailing',
        description: 'Complete interior cleaning including vacuuming, upholstery cleaning, and dashboard detailing.'
      },
      {
        title: 'Car Exterior Washing & Waxing',
        description: 'Professional exterior wash, polish, and wax to protect and enhance your vehicle\'s appearance.'
      }
    ]
  }
};

export function ServiceDetail() {
  const { serviceId } = useParams<{ serviceId: string }>();
  const service = serviceId ? serviceData[serviceId] : null;

  if (!service) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white">
        <div className="text-center">
          <h1 className="text-4xl mb-4 text-gray-900">Service Not Found</h1>
          <Link to="/services" className="text-emerald-600 hover:underline text-lg font-medium">
            Back to Services
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Green Hero Banner with Logo */}
      <section className="relative text-white py-24 md:py-32 overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0">
          <ImageWithFallback
            src={service.heroImage}
            alt={service.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-900/80 via-emerald-800/70 to-emerald-900/80"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            {/* CIOS Logo */}
            <div className="flex justify-center mb-8">
              <img src={ciosLogo} alt="CIOS" className="w-24 h-24 object-contain" />
            </div>

            {/* Service Title */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {service.title}
            </h1>

            {/* Eco Badge */}
            <div className="inline-flex items-center gap-2 bg-[#F4C430] text-black px-6 py-3 rounded-full font-semibold">
              <Leaf className="w-5 h-5" />
              <span>ECO-FRIENDLY SERVICE</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section with Green Accents */}
      <section className="py-16 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Left - Description & Green Features */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-gray-700 leading-relaxed text-lg mb-8">
                {service.description}
              </p>

              {/* Green Cleaning Benefits */}
              <div className="bg-gradient-to-br from-emerald-50 to-green-50 border-4 border-emerald-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                    <Leaf className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-emerald-900">
                    Our Green Cleaning Promise
                  </h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Eco-Friendly Products</h4>
                      <p className="text-emerald-800 text-sm">Biodegradable, non-toxic cleaning solutions</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Droplets className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Water Conservation</h4>
                      <p className="text-emerald-800 text-sm">Efficient cleaning methods that reduce water waste</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Recycle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Sustainable Practices</h4>
                      <p className="text-emerald-800 text-sm">Recycling and proper waste management protocols</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Shield className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-emerald-900">Safe for All</h4>
                      <p className="text-emerald-800 text-sm">Products safe for people, pets, and the planet</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right - Image */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl overflow-hidden shadow-2xl border-4 border-[#F4C430]"
            >
              <ImageWithFallback
                src={service.detailImage}
                alt={service.title}
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services List Section with Green Cards */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our {service.title.replace('Cleaning', '').trim()} Services Include:
            </h2>
            <p className="text-lg text-gray-600">
              All services performed with eco-friendly products and sustainable practices
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {service.services.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05 }}
                className="bg-gradient-to-br from-[#F4C430]/10 to-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all border-4 border-emerald-200 hover:border-emerald-400 group"
              >
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 flex-grow">
                    {item.title}
                  </h3>
                </div>
                <p className="text-gray-600 leading-relaxed pl-13">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Green CTA Section */}
      <section className="py-20 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-800 text-white relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-[#F4C430] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex justify-center mb-6">
              <Leaf className="w-16 h-16 text-[#F4C430]" />
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Go Green?
            </h2>
            <p className="text-xl mb-8 text-emerald-50">
              Experience professional {service.title.toLowerCase()} that cares for your space and our planet. 
              Get your free eco-friendly quote today!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/get-quote"
                className="inline-flex items-center justify-center px-10 py-4 bg-[#F4C430] text-black rounded-full hover:bg-[#e5b520] transition-all transform hover:scale-105 font-semibold shadow-xl"
              >
                Get Your Free Quote
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/services"
                className="inline-flex items-center justify-center px-10 py-4 bg-white/10 border-2 border-white/30 text-white rounded-full hover:bg-white/20 transition-all font-semibold backdrop-blur-sm"
              >
                View All Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
