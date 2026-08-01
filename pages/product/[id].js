import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../../lib/supabase';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', address: '', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('photos');
  const [darkMode, setDarkMode] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderData, setOrderData] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadProduct();
    }
  }, [id]);

  const loadProduct = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
      
      if (!error && data) {
        setProduct(data);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      setLoading(false);
    }
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!product) return;
    
    const order = {
      id: Date.now().toString(),
      name: form.name,
      phone: form.phone,
      address: form.address,
      quantity: form.quantity,
      product: product.name,
      productId: product.id,
      total: product.price * form.quantity,
      status: 'Pending',
      createdAt: new Date().toISOString()
    };
    
    try {
      const { error } = await supabase
        .from('orders')
        .insert([order]);
      
      if (error) throw error;
      
      const existing = JSON.parse(localStorage.getItem('orders') || '[]');
      existing.push(order);
      localStorage.setItem('orders', JSON.stringify(existing));
      
      try {
        const telegramMessage = `
📦 <b>New Order Alert!</b>
👤 Customer: ${order.name}
📱 Phone: ${order.phone}
📍 Address: ${order.address}
🎁 Product: ${order.product}
🔢 Quantity: ${order.quantity}
💰 Total: ETB ${order.total}
🕐 Time: ${new Date().toLocaleString()}
🔗 View: https://hawassagift.shop/admin
        `.trim();

        await fetch('/api/telegram', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: telegramMessage })
        });
      } catch (telegramError) {
        console.error('Telegram error:', telegramError);
      }
      
      setOrderData(order);
      setShowOrderModal(true);
      setIsSubmitting(false);
      setForm({ name: '', phone: '', address: '', quantity: 1 });
      
      setTimeout(() => {
        setShowOrderModal(false);
        router.push('/');
      }, 5000);
      
    } catch (error) {
      alert('Error placing order: ' + error.message);
      setIsSubmitting(false);
    }
  };

  // Share function
  const shareProduct = async () => {
    const shareData = {
      title: product.name,
      text: `Check out ${product.name} - ETB ${product.price} on Famous Gifts Hawassa! 🎁`,
      url: `https://hawassagift.shop/product/${product.id}`
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.log('Share cancelled');
      }
    } else {
      setShowShareModal(true);
    }
  };

  const copyToClipboard = () => {
    const url = `https://hawassagift.shop/product/${product.id}`;
    navigator.clipboard?.writeText(url).then(() => {
      alert('Link copied to clipboard! 📋');
      setShowShareModal(false);
    }).catch(() => {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      alert('Link copied to clipboard! 📋');
      setShowShareModal(false);
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: darkMode ? '#1a1a2e' : 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
        fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
        padding: '12px'
      }}>
        {/* Skeleton loading code */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 16px',
          background: darkMode ? 'rgba(40,40,60,0.8)' : 'rgba(255,255,255,0.95)',
          borderRadius: '12px',
          marginBottom: '16px',
          border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 105, 180, 0.1)',
          animation: 'pulse 1.5s ease-in-out infinite'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '36px', height: '36px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '50%' }} />
            <div>
              <div style={{ width: '100px', height: '14px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '4px', marginBottom: '4px' }} />
              <div style={{ width: '50px', height: '8px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '4px' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ width: '60px', height: '32px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '20px' }} />
            <div style={{ width: '60px', height: '32px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '20px' }} />
          </div>
        </div>

        <div style={{
          maxWidth: '100%',
          margin: '0 auto',
          background: darkMode ? 'rgba(40,40,60,0.8)' : 'white',
          borderRadius: '16px',
          overflow: 'hidden',
          border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 105, 180, 0.1)'
        }}>
          <div style={{
            background: darkMode ? 'rgba(30,30,50,0.5)' : '#fafafa',
            padding: '16px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: '0.2s'
          }}>
            <div style={{
              width: '100%',
              height: '250px',
              background: darkMode ? '#333' : '#e8e8e8',
              borderRadius: '12px'
            }} />
          </div>

          <div style={{ padding: '20px 18px' }}>
            <div style={{
              width: '80px',
              height: '20px',
              background: darkMode ? '#333' : '#e8e8e8',
              borderRadius: '16px',
              marginBottom: '10px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.3s'
            }} />
            <div style={{
              width: '70%',
              height: '28px',
              background: darkMode ? '#333' : '#e8e8e8',
              borderRadius: '4px',
              marginBottom: '8px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.4s'
            }} />
            <div style={{
              width: '40%',
              height: '32px',
              background: darkMode ? '#333' : '#e8e8e8',
              borderRadius: '4px',
              marginBottom: '15px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.5s'
            }} />
            <div style={{
              width: '100%',
              height: '80px',
              background: darkMode ? '#333' : '#e8e8e8',
              borderRadius: '12px',
              marginBottom: '18px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.6s'
            }} />
            <div style={{ display: 'grid', gap: '10px' }}>
              <div style={{ width: '100%', height: '48px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.7s' }} />
              <div style={{ width: '100%', height: '48px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.8s' }} />
              <div style={{ width: '100%', height: '48px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '12px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '0.9s' }} />
              <div style={{ width: '100%', height: '56px', background: darkMode ? '#333' : '#e8e8e8', borderRadius: '14px', animation: 'pulse 1.5s ease-in-out infinite', animationDelay: '1s' }} />
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        background: darkMode ? '#1a1a2e' : 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
        padding: '20px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😕</div>
        <h2 style={{ color: darkMode ? '#f0f0f0' : '#333' }}>Product Not Found</h2>
        <p style={{ color: darkMode ? '#888' : '#666' }}>The product you're looking for doesn't exist.</p>
        <button
          onClick={() => router.push('/')}
          style={{
            marginTop: '20px',
            background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
            color: 'white',
            border: 'none',
            padding: '12px 40px',
            borderRadius: '30px',
            fontSize: '1rem',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Fix images array
  let images = [];
  if (product.images) {
    if (Array.isArray(product.images)) {
      images = product.images;
    } else if (typeof product.images === 'string') {
      try {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) {
          images = parsed;
        } else if (parsed && typeof parsed === 'string' && parsed.startsWith('http')) {
          images = [parsed];
        }
      } catch (e) {
        if (product.images.startsWith('http')) {
          images = [product.images];
        }
      }
    }
  }

  if (images.length === 0 && product.thumbnail) {
    images = [product.thumbnail];
  }

  const hasVideo = product.video && product.video.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: darkMode ? '#1a1a2e' : 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      padding: '12px',
      transition: 'all 0.5s ease',
      color: darkMode ? '#f0f0f0' : '#333'
    }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: darkMode ? 'rgba(26, 26, 46, 0.85)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        boxShadow: darkMode ? '0 2px 20px rgba(0,0,0,0.3)' : '0 2px 20px rgba(255, 105, 180, 0.1)',
        marginBottom: '16px',
        border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <img 
            src="/logo.png" 
            alt="Famous Gifts Logo" 
            style={{ 
              height: '30px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
          <div>
            <h1 style={{ color: darkMode ? '#FF69B4' : '#FF1493', margin: 0, fontSize: '1rem', fontWeight: '700' }}>Famous Gifts</h1>
            <p style={{ color: '#FF69B4', margin: 0, fontSize: '0.5rem', letterSpacing: '1px' }}>HAWASSA</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <motion.button
            onClick={toggleDarkMode}
            whileHover={{ scale: 1.1, rotate: 15 }}
            whileTap={{ scale: 0.9 }}
            style={{
              background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
              border: darkMode ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(255, 105, 180, 0.2)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              color: darkMode ? '#FFD700' : '#FF1493'
            }}
          >
            {darkMode ? '☀️' : '🌙'}
          </motion.button>
          <button
            onClick={() => router.push('/')}
            style={{
              color: darkMode ? '#FF69B4' : '#FF1493',
              fontWeight: '600',
              fontSize: '0.8rem',
              padding: '6px 14px',
              borderRadius: '20px',
              background: darkMode ? 'rgba(255,105,180,0.1)' : 'rgba(255, 105, 180, 0.1)',
              border: darkMode ? '1px solid rgba(255,105,180,0.2)' : '1px solid rgba(255, 105, 180, 0.2)',
              cursor: 'pointer'
            }}
          >
            ← Back
          </button>
          <a 
            href="tel:+251909495969" 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
              color: 'white',
              padding: '6px 14px',
              borderRadius: '20px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.8rem',
              boxShadow: '0 4px 15px rgba(255, 20, 147, 0.3)',
            }}
          >
            📞 Call
          </a>
        </div>
      </nav>

      {/* Product Detail - Improved Gallery */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        background: darkMode ? 'rgba(40, 40, 60, 0.85)' : 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: darkMode ? '0 5px 30px rgba(0,0,0,0.3)' : '0 5px 30px rgba(0,0,0,0.06)',
        border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        {/* Gallery Section - Improved */}
        <div style={{
          background: darkMode ? 'rgba(20, 20, 40, 0.8)' : '#f8f8f8',
          padding: '16px',
          position: 'relative'
        }}>
          {/* Tab Switcher */}
          {hasVideo && images.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              background: darkMode ? 'rgba(50,50,70,0.5)' : 'white',
              padding: '4px',
              borderRadius: '10px',
              boxShadow: darkMode ? '0 2px 10px rgba(0,0,0,0.2)' : '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <button
                onClick={() => setActiveTab('photos')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'photos' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : 'transparent',
                  color: activeTab === 'photos' ? 'white' : (darkMode ? '#888' : '#666'),
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  flex: 1,
                  transition: 'all 0.3s'
                }}
              >
                📸 Photos ({images.length})
              </button>
              <button
                onClick={() => setActiveTab('video')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'video' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : 'transparent',
                  color: activeTab === 'video' ? 'white' : (darkMode ? '#888' : '#666'),
                  cursor: 'pointer',
                  fontWeight: '600',
                  fontSize: '0.8rem',
                  flex: 1,
                  transition: 'all 0.3s'
                }}
              >
                🎥 Video
              </button>
            </div>
          )}

          {/* Photos Tab - Improved Gallery */}
          {activeTab === 'photos' && (
            <>
              {/* Main Image - Larger and centered */}
              <div style={{ 
                width: '100%', 
                marginBottom: '14px',
                background: darkMode ? 'rgba(10,10,20,0.5)' : 'white',
                borderRadius: '12px',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '320px',
                position: 'relative'
              }}>
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    loading="lazy"
                    style={{
                      width: '100%',
                      maxHeight: '450px',
                      objectFit: 'contain',
                      padding: '10px',
                      transition: 'all 0.3s ease'
                    }}
                    onError={(e) => {
                      console.log('Image failed to load:', images[selectedImage]);
                      e.target.style.display = 'none';
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '320px',
                    fontSize: '5rem',
                    background: darkMode ? 'rgba(30,30,50,0.5)' : '#FFF0F5',
                    borderRadius: '12px',
                    width: '100%'
                  }}>
                    🎁
                  </div>
                )}

                {/* Image counter badge */}
                {images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: '16px',
                    right: '16px',
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(10px)',
                    color: 'white',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '0.75rem',
                    fontWeight: '600'
                  }}>
                    {selectedImage + 1} / {images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails - Scrollable with better styling */}
              {images.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  overflowX: 'auto',
                  width: '100%',
                  padding: '6px 2px 10px',
                  WebkitOverflowScrolling: 'touch',
                  scrollbarWidth: 'thin',
                  scrollSnapType: 'x mandatory'
                }}>
                  {images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        flexShrink: 0,
                        width: '80px',
                        height: '80px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === index ? '3px solid #FF1493' : darkMode ? '2px solid rgba(255,255,255,0.08)' : '2px solid transparent',
                        boxShadow: selectedImage === index ? '0 0 20px rgba(255,20,147,0.3)' : 'none',
                        transition: 'all 0.3s ease',
                        scrollSnapAlign: 'start',
                        position: 'relative'
                      }}
                    >
                      <img
                        src={img}
                        alt={'Thumbnail ' + index}
                        loading="lazy"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          transition: 'transform 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (selectedImage !== index) {
                            e.target.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'scale(1)';
                        }}
                        onError={(e) => {
                          console.log('Thumbnail failed to load:', img);
                          e.target.style.display = 'none';
                        }}
                      />
                      {selectedImage === index && (
                        <div style={{
                          position: 'absolute',
                          bottom: '4px',
                          right: '4px',
                          background: '#FF1493',
                          color: 'white',
                          fontSize: '0.5rem',
                          padding: '2px 6px',
                          borderRadius: '10px',
                          fontWeight: '600'
                        }}>
                          ●
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Video Tab */}
          {activeTab === 'video' && hasVideo && (
            <div style={{ 
              width: '100%',
              background: darkMode ? 'rgba(10,10,20,0.5)' : '#f0f0f0',
              borderRadius: '12px',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '320px'
            }}>
              <video
                src={product.video}
                style={{
                  width: '100%',
                  maxHeight: '450px',
                  objectFit: 'contain',
                  background: darkMode ? 'rgba(10,10,20,0.5)' : '#f0f0f0',
                  padding: '10px'
                }}
                controls
                autoPlay
                playsInline
              />
            </div>
          )}
        </div>

        {/* Product Info */}
        <div style={{
          padding: '20px 18px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{
                background: darkMode ? 'rgba(255,20,147,0.2)' : '#FFF0F5',
                padding: '3px 14px',
                borderRadius: '16px',
                fontSize: '0.7rem',
                color: '#FF1493',
                fontWeight: '600',
                display: 'inline-block',
                marginBottom: '10px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase'
              }}>
                {product.category || 'Gifts'}
              </span>
            </div>
            {/* Share Button */}
            <motion.button
              onClick={shareProduct}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              style={{
                background: darkMode ? 'rgba(255,255,255,0.05)' : '#f0f0f0',
                border: darkMode ? '1px solid rgba(255,255,255,0.08)' : '1px solid #eee',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: '1.2rem',
                color: darkMode ? '#f0f0f0' : '#333',
                transition: 'all 0.3s ease'
              }}
            >
              📤
            </motion.button>
          </div>

          <h1 style={{
            fontSize: '1.6rem',
            color: darkMode ? '#f0f0f0' : '#222',
            margin: '0 0 6px 0',
            fontWeight: '700',
            lineHeight: '1.2'
          }}>
            {product.name}
          </h1>

          <p style={{
            fontSize: '1.8rem',
            fontWeight: '700',
            color: '#FF1493',
            margin: '0 0 15px 0'
          }}>
            ETB {product.price.toLocaleString()}
          </p>

          <div style={{
            background: darkMode ? 'rgba(255,20,147,0.05)' : '#FFF9FB',
            padding: '14px',
            borderRadius: '12px',
            border: darkMode ? '1px solid rgba(255,20,147,0.1)' : '1px solid #FFE4EC',
            marginBottom: '18px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: darkMode ? '#aaa' : '#555',
              lineHeight: '1.7'
            }}>
              {product.description}
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gap: '10px' }}>
              <input
                type="text"
                placeholder="Full name"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  border: darkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid #eee',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                  color: darkMode ? '#f0f0f0' : '#333',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                  WebkitAppearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                onBlur={(e) => e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee'}
              />
              <input
                type="tel"
                placeholder="Phone number"
                value={form.phone}
                onChange={(e) => setForm({...form, phone: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  border: darkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid #eee',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                  color: darkMode ? '#f0f0f0' : '#333',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                  WebkitAppearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                onBlur={(e) => e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee'}
              />
              <input
                type="text"
                placeholder="Delivery address"
                value={form.address}
                onChange={(e) => setForm({...form, address: e.target.value})}
                required
                style={{
                  width: '100%',
                  padding: '14px',
                  border: darkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid #eee',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                  color: darkMode ? '#f0f0f0' : '#333',
                  background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                  WebkitAppearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                onBlur={(e) => e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee'}
              />
              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({...form, quantity: parseInt(e.target.value)})}
                    required
                    style={{
                      width: '100%',
                      padding: '14px',
                      border: darkMode ? '2px solid rgba(255,255,255,0.1)' : '2px solid #eee',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s',
                      color: darkMode ? '#f0f0f0' : '#333',
                      background: darkMode ? 'rgba(255,255,255,0.05)' : 'white',
                      WebkitAppearance: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                    onBlur={(e) => e.target.style.borderColor = darkMode ? 'rgba(255,255,255,0.1)' : '#eee'}
                  />
                </div>
                <div style={{
                  flex: 1.5,
                  background: darkMode ? 'rgba(255,20,147,0.1)' : '#FFF0F5',
                  padding: '14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1rem', color: darkMode ? '#f0f0f0' : '#333' }}>
                    <strong>Total:</strong> ETB {(product.price * form.quantity).toLocaleString()}
                  </span>
                </div>
              </div>

              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting}
                style={{
                  background: isSubmitting ? '#ccc' : 'linear-gradient(135deg, #FF1493, #FF69B4)',
                  color: 'white',
                  border: 'none',
                  padding: '16px',
                  borderRadius: '14px',
                  fontSize: '1.1rem',
                  cursor: isSubmitting ? 'not-allowed' : 'pointer',
                  fontWeight: '700',
                  boxShadow: '0 5px 25px rgba(255, 20, 147, 0.3)',
                  transition: 'all 0.3s',
                  marginTop: '4px',
                  width: '100%'
                }}
              >
                {isSubmitting ? '⏳ Processing...' : '📦 Place Order'}
              </motion.button>
            </div>
          </form>
        </div>
      </div>

      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: darkMode ? '#666' : '#888',
        fontSize: '0.8rem',
        maxWidth: '100%',
        margin: '16px auto 0'
      }}>
        <p>🎁 Famous Gifts Hawassa — Made with Love 💕</p>
        <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>Call us: +251 90 949 5969</p>
      </footer>

      {/* ========== ORDER CONFIRMATION MODAL ========== */}
      <AnimatePresence>
        {showOrderModal && orderData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 2000,
              padding: '20px'
            }}
            onClick={() => setShowOrderModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                maxWidth: '420px',
                width: '100%',
                background: darkMode ? '#2a2a3e' : 'white',
                borderRadius: '24px',
                padding: '40px 30px',
                boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
                border: '2px solid #FF1493',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{
                position: 'absolute',
                top: '-50%',
                right: '-50%',
                width: '100%',
                height: '100%',
                background: 'radial-gradient(circle, rgba(255,20,147,0.05) 0%, transparent 70%)',
                borderRadius: '50%'
              }} />
              
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', damping: 15 }}
                style={{
                  fontSize: '4rem',
                  marginBottom: '15px',
                  display: 'inline-block'
                }}
              >
                ✅
              </motion.div>
              
              <h2 style={{
                color: '#FF1493',
                fontSize: '1.5rem',
                fontWeight: '700',
                marginBottom: '10px'
              }}>
                Order Placed! 🎉
              </h2>
              
              <p style={{
                color: darkMode ? '#ccc' : '#555',
                fontSize: '1rem',
                lineHeight: '1.6',
                marginBottom: '5px'
              }}>
                We will call <strong style={{ color: '#FF1493' }}>{orderData.phone}</strong> within 24 hours.
              </p>
              
              <p style={{
                color: darkMode ? '#888' : '#999',
                fontSize: '0.85rem',
                marginTop: '5px'
              }}>
                Thank you for shopping with Famous Gifts Hawassa! 💕
              </p>
              
              <div style={{
                marginTop: '20px',
                padding: '12px',
                background: darkMode ? 'rgba(255,20,147,0.1)' : '#FFF0F5',
                borderRadius: '12px',
                border: darkMode ? '1px solid rgba(255,20,147,0.2)' : '1px solid #FFE4EC'
              }}>
                <p style={{
                  margin: 0,
                  fontSize: '0.8rem',
                  color: darkMode ? '#888' : '#999'
                }}>
                  📍 Order ID: <span style={{ color: '#FF1493', fontWeight: '600' }}>#{orderData.id}</span>
                </p>
                <p style={{
                  margin: '5px 0 0',
                  fontSize: '0.8rem',
                  color: darkMode ? '#888' : '#999'
                }}>
                  💰 Total: <span style={{ color: '#FF1493', fontWeight: '600' }}>ETB {orderData.total}</span>
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setShowOrderModal(false);
                  router.push('/');
                }}
                style={{
                  marginTop: '20px',
                  background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                  color: 'white',
                  border: 'none',
                  padding: '14px 40px',
                  borderRadius: '50px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  boxShadow: '0 5px 25px rgba(255, 20, 147, 0.3)',
                  transition: 'all 0.3s',
                  width: '100%'
                }}
              >
                Continue Shopping 🛍️
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== SHARE MODAL ========== */}
      <AnimatePresence>
        {showShareModal && product && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 3000,
              padding: '20px'
            }}
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.8, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 20 }}
              style={{
                maxWidth: '420px',
                width: '100%',
                background: darkMode ? '#2a2a3e' : 'white',
                borderRadius: '24px',
                padding: '35px 30px',
                boxShadow: '0 30px 80px rgba(0,0,0,0.3)',
                border: '2px solid #FF1493',
                textAlign: 'center'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2 style={{ 
                color: '#FF1493', 
                fontSize: '1.3rem', 
                fontWeight: '700',
                marginBottom: '10px'
              }}>
                📤 Share Product
              </h2>
              
              <p style={{
                color: darkMode ? '#ccc' : '#555',
                fontSize: '0.9rem',
                marginBottom: '20px'
              }}>
                Share this product with your friends and family!
              </p>

              {/* Share URL */}
              <div style={{
                display: 'flex',
                gap: '10px',
                background: darkMode ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
                padding: '10px 14px',
                borderRadius: '12px',
                marginBottom: '20px',
                alignItems: 'center'
              }}>
                <input
                  type="text"
                  value={`https://hawassagift.shop/product/${product.id}`}
                  readOnly
                  style={{
                    flex: 1,
                    border: 'none',
                    background: 'transparent',
                    color: darkMode ? '#ccc' : '#333',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <button
                  onClick={copyToClipboard}
                  style={{
                    background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                    color: 'white',
                    border: 'none',
                    padding: '6px 16px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.8rem'
                  }}
                >
                  Copy
                </button>
              </div>

              {/* Share Buttons */}
              <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    window.open(`https://t.me/share/url?url=https://hawassagift.shop/product/${product.id}&text=Check out ${product.name} from Famous Gifts! 🎁`, '_blank');
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#0088cc',
                    color: 'white',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ✈️
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    window.open(`https://wa.me/?text=Check out ${product.name} from Famous Gifts! 🎁 https://hawassagift.shop/product/${product.id}`, '_blank');
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#25D366',
                    color: 'white',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  💬
                </motion.button>
                
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    window.open(`https://www.facebook.com/sharer/sharer.php?u=https://hawassagift.shop/product/${product.id}`, '_blank');
                  }}
                  style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    background: '#1877F2',
                    color: 'white',
                    fontSize: '1.8rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  📘
                </motion.button>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowShareModal(false)}
                style={{
                  marginTop: '20px',
                  background: darkMode ? 'rgba(255,255,255,0.1)' : '#f0f0f0',
                  color: darkMode ? '#ccc' : '#333',
                  border: 'none',
                  padding: '10px 30px',
                  borderRadius: '30px',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Close
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}