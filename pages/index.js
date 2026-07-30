import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import Link from 'next/link';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      id: 1,
      image: '/images/slide1.jpg',
      title: '🎁 Beautiful Gifts',
      subtitle: 'Handcrafted with love for every occasion',
      cta: 'Shop Now →'
    },
    {
      id: 2,
      image: '/images/slide2.jpg',
      title: '💐 Premium Quality',
      subtitle: 'Discover our amazing collection',
      cta: 'View Collection →'
    },
    {
      id: 3,
      image: '/images/slide3.jpg',
      title: '🎀 Unique Designs',
      subtitle: 'Beautiful gifts for your loved ones',
      cta: 'Explore Now →'
    },
  ];

  import { supabase } from '../lib/supabase';

// Then in the component:
useEffect(() => {
  setIsClient(true);
  loadProducts();
}, []);

const loadProducts = async () => {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('createdAt', { ascending: false });
    
    if (!error && data) {
      setProducts(data);
    }
  } catch (error) {
    console.error('Error loading products:', error);
  }
};

  useEffect(() => {
    if (isClient) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isClient]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  if (!isClient) {
    return (
      <div style={{ 
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        padding: '20px'
      }}>
        <h1 style={{ textAlign: 'center', color: '#FF1493' }}>Loading...</h1>
      </div>
    );
  }

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      
      {/* Navigation Bar - Mobile Optimized */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '12px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 30px rgba(255, 105, 180, 0.15)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          borderBottom: '2px solid rgba(255, 105, 180, 0.2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '1.5rem' }}>🎁</span>
          <div>
            <h1 style={{ color: '#FF1493', margin: 0, fontSize: '1.1rem', fontWeight: '700' }}>Famous Gifts</h1>
            <p style={{ color: '#FF69B4', margin: 0, fontSize: '0.55rem', letterSpacing: '1px' }}>HAWASSA</p>
          </div>
        </div>
        
        <a 
          href="tel:+251909495969" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
            color: 'white',
            padding: '8px 14px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.8rem',
            boxShadow: '0 5px 20px rgba(255, 20, 147, 0.3)',
          }}
        >
          <span style={{ fontSize: '1rem' }}>📞</span>
          Call
        </a>
      </motion.nav>

      {/* Hero Carousel - Mobile Optimized */}
      <div style={{
        position: 'relative',
        margin: '12px 12px 20px',
        borderRadius: '16px',
        overflow: 'hidden',
        height: '250px',
        boxShadow: '0 10px 40px rgba(255, 20, 147, 0.2)',
      }}>
        <AnimatePresence mode='wait'>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            style={{
              width: '100%',
              height: '100%',
              position: 'relative',
              backgroundImage: `url(${slides[currentSlide].image})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(135deg, rgba(255,20,147,0.5), rgba(0,0,0,0.3))',
            }} />

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
              width: '90%',
              maxWidth: '700px',
              zIndex: 2,
              padding: '10px'
            }}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h2 style={{
                  fontSize: '1.6rem',
                  fontWeight: '800',
                  margin: '5px 0',
                  textShadow: '0 2px 20px rgba(0,0,0,0.2)'
                }}>
                  {slides[currentSlide].title}
                </h2>
                <p style={{
                  fontSize: '0.85rem',
                  opacity: 0.95,
                  marginBottom: '15px',
                  textShadow: '0 2px 15px rgba(0,0,0,0.15)'
                }}>
                  {slides[currentSlide].subtitle}
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  style={{
                    background: 'white',
                    color: '#FF1493',
                    border: 'none',
                    padding: '10px 28px',
                    borderRadius: '50px',
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.15)'
                  }}
                  onClick={() => document.getElementById('products').scrollIntoView({ behavior: 'smooth' })}
                >
                  {slides[currentSlide].cta}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Dots */}
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '8px',
          zIndex: 10
        }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: currentSlide === index ? '24px' : '8px',
                height: '8px',
                borderRadius: '10px',
                border: 'none',
                background: currentSlide === index ? 'white' : 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                padding: 0
              }}
            />
          ))}
        </div>
      </div>

      {/* Products Section - Mobile Optimized */}
      <div id="products" style={{ padding: '10px 12px 40px' }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <h2 style={{ 
            fontSize: '1.5rem', 
            color: '#333', 
            marginBottom: '4px',
            fontWeight: '600'
          }}>
            Our Collection 🎀
          </h2>
          <p style={{ color: '#888', fontSize: '0.85rem' }}>
            {products.length} products available
          </p>
        </div>

        {products.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '40px 20px', 
            background: 'white', 
            borderRadius: '16px',
            boxShadow: '0 5px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '15px' }}>🎁</div>
            <p style={{ fontSize: '1rem', color: '#555' }}>No products available yet.</p>
            <p style={{ color: '#999', fontSize: '0.85rem' }}>Check back soon for amazing gifts!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(155px, 1fr))', 
            gap: '14px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {products.map((p, index) => (
              <Link href={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  whileHover={{ 
                    y: -5,
                    boxShadow: '0 15px 40px rgba(255, 105, 180, 0.2)'
                  }}
                  style={{
                    background: 'white',
                    borderRadius: '14px',
                    overflow: 'hidden',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 105, 180, 0.08)'
                  }}
                >
                  <div style={{ 
                    position: 'relative',
                    height: '160px',
                    background: '#f8f8f8',
                    overflow: 'hidden'
                  }}>
                    {p.thumbnail ? (
                      <img 
                        src={p.thumbnail} 
                        alt={p.name} 
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                      />
                    ) : p.image ? (
                      <img 
                        src={p.image} 
                        alt={p.name} 
                        style={{ 
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.5s ease'
                        }}
                      />
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        fontSize: '3rem',
                        background: '#FFF0F5'
                      }}>
                        🎁
                      </div>
                    )}
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '8px',
                      right: '8px',
                      background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)'
                    }}>
                      ETB {p.price.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ padding: '12px 14px 14px' }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '0.9rem', 
                      color: '#333',
                      fontWeight: '600',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {p.name}
                    </h3>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '6px'
                    }}>
                      <span style={{
                        background: '#FFF0F5',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontSize: '0.6rem',
                        color: '#FF1493',
                        fontWeight: '500'
                      }}>
                        {p.category || 'Gifts'}
                      </span>
                      <span style={{
                        fontSize: '0.65rem',
                        color: '#FF69B4',
                        fontWeight: '500'
                      }}>
                        View →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer - Mobile Optimized */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          padding: '25px',
          background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
          color: 'white',
          marginTop: '10px'
        }}
      >
        <p style={{ fontSize: '1rem', marginBottom: '3px' }}>🎁 Famous Gifts Hawassa</p>
        <p style={{ opacity: 0.7, fontSize: '0.75rem' }}>© 2026 All rights reserved</p>
        <p style={{ opacity: 0.6, fontSize: '0.7rem' }}>Call us: +251 90 949 5969</p>
      </motion.footer>
    </div>
  );
}