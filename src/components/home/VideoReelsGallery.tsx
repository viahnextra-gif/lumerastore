import { motion } from 'framer-motion';
import { Play, ExternalLink } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Instagram Reels embed URLs — update these with your latest reels
const reels = [
  {
    id: '1',
    embedUrl: 'https://www.instagram.com/reel/EXAMPLE1/embed',
    thumbnail: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&h=711&fit=crop',
    link: 'https://www.instagram.com/reel/EXAMPLE1/',
  },
  {
    id: '2',
    embedUrl: 'https://www.instagram.com/reel/EXAMPLE2/embed',
    thumbnail: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=400&h=711&fit=crop',
    link: 'https://www.instagram.com/reel/EXAMPLE2/',
  },
  {
    id: '3',
    embedUrl: 'https://www.instagram.com/reel/EXAMPLE3/embed',
    thumbnail: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&h=711&fit=crop',
    link: 'https://www.instagram.com/reel/EXAMPLE3/',
  },
  {
    id: '4',
    embedUrl: 'https://www.instagram.com/reel/EXAMPLE4/embed',
    thumbnail: 'https://images.unsplash.com/photo-1495385794356-15371f348c31?w=400&h=711&fit=crop',
    link: 'https://www.instagram.com/reel/EXAMPLE4/',
  },
  {
    id: '5',
    embedUrl: 'https://www.instagram.com/reel/EXAMPLE5/embed',
    thumbnail: 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400&h=711&fit=crop',
    link: 'https://www.instagram.com/reel/EXAMPLE5/',
  },
  {
    id: '6',
    embedUrl: 'https://www.instagram.com/reel/EXAMPLE6/embed',
    thumbnail: 'https://images.unsplash.com/photo-1487222477894-8943e31ef7b2?w=400&h=711&fit=crop',
    link: 'https://www.instagram.com/reel/EXAMPLE6/',
  },
];

export default function VideoReelsGallery() {
  const { t } = useLanguage();

  return (
    <section className="py-20">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-4xl font-bold text-foreground mb-2">{t('reels.title')}</h2>
          <p className="text-muted-foreground">{t('reels.subtitle')}</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {reels.map((reel, index) => (
            <motion.a
              key={reel.id}
              href={reel.link}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative aspect-[9/16] rounded-2xl overflow-hidden bg-muted"
            >
              <img
                src={reel.thumbnail}
                alt={`Reel ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                loading="lazy"
              />
              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              {/* Play icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-primary-foreground/30 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <Play className="h-5 w-5 text-primary-foreground fill-primary-foreground" />
                </div>
              </div>
              {/* External link */}
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                <ExternalLink className="h-4 w-4 text-primary-foreground" />
              </div>
            </motion.a>
          ))}
        </div>
      </div>
    </section>
  );
}
