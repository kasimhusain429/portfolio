export const projects = [
  {
    id: 'aether-ui',
    title: 'Aether UI Dashboard',
    description: 'An operations-focused dashboard with role-based views, fast navigation, and production-grade UI patterns.',
    category: 'Operations Dashboard',
    tech: ['React', 'Tailwind', 'Framer Motion'],
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    live: 'https://operations.wlsandbox.com',
    github: 'https://github.com/yourname/aether-ui',
    highlights: {
      features: ['Operations KPI overview', 'Role-based modules & views', 'Fast global search'],
      challenges: ['Optimized rendering for dense, data-heavy views', 'Designed consistent empty/loading states'],
      results: ['Improved perceived performance with skeletons + motion', 'Clearer workflows through reusable UI primitives'],
    },
  },
  {
    id: 'lumen-saas',
    title: 'Appointment',
    description: 'A conversion-focused appointment booking experience with polished UX, strong information hierarchy, and responsive layouts.',
    category: 'Appointment Booking',
    tech: ['React', 'Tailwind', 'Framer Motion'],
    image: 'https://images.unsplash.com/photo-1526256262350-7da7584cf5eb?auto=format&fit=crop&w=1200&q=80',
    live: 'https://darrylmontgomery.com/?v=2',
    github: 'https://github.com/yourname/lumen-saas',
    highlights: {
      features: ['Clear CTA flow & sections', 'Mobile-first layout', 'Smooth micro-interactions'],
      challenges: ['Balancing visual polish with load performance', 'Maintaining consistent spacing and type rhythm'],
      results: ['Higher perceived trust via clean UI', 'Improved scannability and conversion-friendly structure'],
    },
  },
  {
    id: 'nebula-portfolio',
    title: 'E-commerce Site',
    description: 'A modern e-commerce storefront experience focused on clean merchandising, fast browsing, and premium product presentation.',
    category: 'E-commerce',
    tech: ['React', 'Tailwind', 'Framer Motion'],
    image: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1200&q=80',
    live: 'https://shopfarrbetter.com/',
    github: 'https://github.com/yourname/nebula-portfolio',
    highlights: {
      features: ['Product-first layout', 'Responsive catalog browsing', 'Design-system driven components'],
      challenges: ['Keeping UI consistent across reusable sections', 'Maintaining performance with image-heavy pages'],
      results: ['Premium storefront feel with minimal visual noise', 'Reusable card/grid system for scaling content'],
    },
  },
]

export const projectCategories = ['All', 'Operations Dashboard', 'Appointment Booking', 'E-commerce']
