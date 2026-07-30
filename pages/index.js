import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export default function Home() {
  const [isClient, setIsClient] = useState(false);
  const [products, setProducts] = useState([]);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Replace these with your own images in public/images/
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

  useEffect(() => {
    setIsClient(true);
    const savedProducts = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(savedProducts);
  }, []);

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
      
      {/* Navigation Bar */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 100 }}
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          padding: '18px 50px',
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '2rem' }}>🎁</span>
          <div>
            <h1 style={{ color: '#FF1493', margin: 0, fontSize: '1.5rem', fontWeight: '700' }}>Famous Gifts</h1>
            <p style={{ color: '#FF69B4', margin: 0, fontSize: '0.7rem', letterSpacing: '2px' }}>HAWASSA</p>
          </div>
        </div>
        
        {/* Call Button */}
        <a 
          href="tel:+251909495969" 
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
            color: 'white',
            padding: '10px 20px',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '0.95rem',
            boxShadow: '0 5px 20px rgba(255, 20, 147, 0.3)',
            transition: 'all 0.3s ease',
            border: 'none',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'scale(1.05)';
            e.target.style.boxShadow = '0 8px 30px rgba(255, 20, 147, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'scale(1)';
            e.target.style.boxShadow = '0 5px 20px rgba(255, 20, 147, 0.3)';
          }}
        >
          <span style={{ fontSize: '1.2rem' }}>📞</span>
          Call Us
        </a>
      </motion.nav>

      {/* Hero Carousel */}
      <div style={{
        position: 'relative',
        margin: '20px 50px 40px',
        borderRadius: '24px',
        overflow: 'hidden',
        height: '480px',
        boxShadow: '0 20px 60px rgba(255, 20, 147, 0.25)',
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
              background: 'linear-gradient(135deg, rgba(255,20,147,0.4), rgba(0,0,0,0.25))',
            }} />

            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              textAlign: 'center',
              color: 'white',
              width: '80%',
              maxWidth: '700px',
              zIndex: 2
            }}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
              >
                <h2 style={{
                  fontSize: '3rem',
                  fontWeight: '800',
                  margin: '10px 0',
                  textShadow: '0 2px 30px rgba(0,0,0,0.2)'
                }}>
                  {slides[currentSlide].title}
                </h2>
                <p style={{
                  fontSize: '1.2rem',
                  opacity: 0.95,
                  marginBottom: '25px',
                  textShadow: '0 2px 20px rgba(0,0,0,0.15)'
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
                    padding: '14px 40px',
                    borderRadius: '50px',
                    fontSize: '1.1rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
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
          bottom: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '12px',
          zIndex: 10
        }}>
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              style={{
                width: currentSlide === index ? '30px' : '12px',
                height: '12px',
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

        {/* Navigation Arrows */}
        <button
          onClick={() => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)}
          style={{
            position: 'absolute',
            left: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: 'none',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            fontSize: '1.8rem',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          ‹
        </button>
        <button
          onClick={() => setCurrentSlide((prev) => (prev + 1) % slides.length)}
          style={{
            position: 'absolute',
            right: '15px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.2)',
            backdropFilter: 'blur(10px)',
            color: 'white',
            border: 'none',
            width: '50px',
            height: '50px',
            borderRadius: '50%',
            fontSize: '1.8rem',
            cursor: 'pointer',
            zIndex: 10,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.4)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255,255,255,0.2)'}
        >
          ›
        </button>
      </div>

      {/* Products Section */}
      <div id="products" style={{ padding: '20px 50px 60px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ 
              fontSize: '2.2rem', 
              color: '#333', 
              marginBottom: '8px',
              fontWeight: '600'
            }}
          >
            Our Collection 🎀
          </motion.h2>
          <p style={{ color: '#888', fontSize: '1rem' }}>
            {products.length} products available
          </p>
        </div>

        {products.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px', 
            background: 'white', 
            borderRadius: '20px',
            boxShadow: '0 5px 30px rgba(0,0,0,0.05)'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🎁</div>
            <p style={{ fontSize: '1.3rem', color: '#555' }}>No products available yet.</p>
            <p style={{ color: '#999' }}>Check back soon for amazing gifts!</p>
          </div>
        ) : (
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', 
            gap: '30px',
            maxWidth: '1400px',
            margin: '0 auto'
          }}>
            {products.map((p, index) => (
              <Link href={`/product/${p.id}`} key={p.id} style={{ textDecoration: 'none' }}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  whileHover={{ 
                    y: -8,
                    boxShadow: '0 20px 50px rgba(255, 105, 180, 0.25)'
                  }}
                  style={{
                    background: 'white',
                    borderRadius: '18px',
                    overflow: 'hidden',
                    boxShadow: '0 5px 25px rgba(0,0,0,0.06)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    border: '1px solid rgba(255, 105, 180, 0.08)'
                  }}
                >
                  <div style={{ 
                    position: 'relative',
                    height: '260px',
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
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      />
                    ) : (
                      <div style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        height: '100%',
                        fontSize: '4rem',
                        background: '#FFF0F5'
                      }}>
                        🎁
                      </div>
                    )}
                    
                    <div style={{
                      position: 'absolute',
                      bottom: '15px',
                      right: '15px',
                      background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                      color: 'white',
                      padding: '8px 18px',
                      borderRadius: '25px',
                      fontSize: '1rem',
                      fontWeight: '700',
                      boxShadow: '0 5px 20px rgba(255, 20, 147, 0.3)'
                    }}>
                      ETB {p.price.toLocaleString()}
                    </div>
                  </div>

                  <div style={{ padding: '18px 20px 20px' }}>
                    <h3 style={{ 
                      margin: 0, 
                      fontSize: '1.1rem', 
                      color: '#333',
                      fontWeight: '600'
                    }}>
                      {p.name}
                    </h3>
                    <div style={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginTop: '10px'
                    }}>
                      <span style={{
                        background: '#FFF0F5',
                        padding: '3px 14px',
                        borderRadius: '15px',
                        fontSize: '0.75rem',
                        color: '#FF1493',
                        fontWeight: '500'
                      }}>
                        {p.category || 'Gifts'}
                      </span>
                      <span style={{
                        fontSize: '0.8rem',
                        color: '#FF69B4',
                        fontWeight: '500'
                      }}>
                        View Details →
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          padding: '35px',
          background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
          color: 'white',
          marginTop: '20px'
        }}
      >
        <p style={{ fontSize: '1.1rem', marginBottom: '5px' }}>🎁 Famous Gifts Hawassa</p>
        <p style={{ opacity: 0.7, fontSize: '0.9rem' }}>© 2026 All rights reserved</p>
        <p style={{ opacity: 0.6, fontSize: '0.85rem' }}>Call us: +251 90 949 5969</p>
      </motion.footer>
    </div>
  );
}