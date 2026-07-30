import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', phone: '', address: '', quantity: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('photos');

  useEffect(() => {
    if (id) {
      const products = JSON.parse(localStorage.getItem('products') || '[]');
      const found = products.find(p => p.id === id);
      setProduct(found || null);
      setLoading(false);
    }
  }, [id]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    if (!product) return;
    
    const order = {
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
    
    const existing = JSON.parse(localStorage.getItem('orders') || '[]');
    existing.push(order);
    localStorage.setItem('orders', JSON.stringify(existing));
    
    setTimeout(() => {
      alert('Order placed! We will call ' + form.phone + ' within 24 hours. Thank you for shopping with Famous Gifts Hawassa!');
      setIsSubmitting(false);
      setForm({ name: '', phone: '', address: '', quantity: 1 });
      router.push('/');
    }, 1000);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '20px' }}>🎁</div>
          <p style={{ color: '#FF1493', fontSize: '1.2rem' }}>Loading product...</p>
        </div>
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
        background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
        padding: '20px'
      }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>😕</div>
        <h2 style={{ color: '#333' }}>Product Not Found</h2>
        <p style={{ color: '#666' }}>The product you're looking for doesn't exist.</p>
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

  const images = product.images && product.images.length > 0 ? product.images : (product.thumbnail ? [product.thumbnail] : []);
  const hasVideo = product.video && product.video.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      padding: '12px'
    }}>
      {/* Navigation - Mobile Optimized */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '12px',
        boxShadow: '0 2px 20px rgba(255, 105, 180, 0.1)',
        marginBottom: '16px',
        border: '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <span style={{ fontSize: '1.5rem' }}>🎁</span>
          <div>
            <h1 style={{ color: '#FF1493', margin: 0, fontSize: '1rem', fontWeight: '700' }}>Famous Gifts</h1>
            <p style={{ color: '#FF69B4', margin: 0, fontSize: '0.5rem', letterSpacing: '1px' }}>HAWASSA</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              color: '#FF1493',
              fontWeight: '600',
              fontSize: '0.8rem',
              padding: '6px 14px',
              borderRadius: '20px',
              background: 'rgba(255, 105, 180, 0.1)',
              border: '1px solid rgba(255, 105, 180, 0.2)',
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

      {/* Product Detail - Mobile Optimized */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 5px 30px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        {/* Image/Video Gallery - Mobile Optimized */}
        <div style={{
          background: '#fafafa',
          padding: '16px',
        }}>
          {/* Tab Switcher */}
          {hasVideo && images.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '8px',
              marginBottom: '12px',
              background: 'white',
              padding: '4px',
              borderRadius: '10px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}>
              <button
                onClick={() => setActiveTab('photos')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === 'photos' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : 'transparent',
                  color: activeTab === 'photos' ? 'white' : '#666',
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
                  color: activeTab === 'video' ? 'white' : '#666',
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

          {/* Photos Tab */}
          {activeTab === 'photos' && (
            <>
              <div style={{ width: '100%', marginBottom: '12px' }}>
                {images.length > 0 ? (
                  <img
                    src={images[selectedImage]}
                    alt={product.name}
                    style={{
                      width: '100%',
                      maxHeight: '300px',
                      objectFit: 'contain',
                      borderRadius: '12px',
                      background: 'white',
                      boxShadow: '0 2px 15px rgba(0,0,0,0.05)'
                    }}
                  />
                ) : (
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '250px',
                    fontSize: '5rem',
                    background: '#FFF0F5',
                    borderRadius: '12px'
                  }}>
                    🎁
                  </div>
                )}
              </div>

              {images.length > 1 && (
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  overflowX: 'auto',
                  width: '100%',
                  padding: '4px 0',
                  WebkitOverflowScrolling: 'touch'
                }}>
                  {images.map((img, index) => (
                    <div
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      style={{
                        flexShrink: 0,
                        width: '60px',
                        height: '60px',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        border: selectedImage === index ? '3px solid #FF1493' : '2px solid transparent',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <img
                        src={img}
                        alt={'Thumbnail ' + index}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Video Tab */}
          {activeTab === 'video' && hasVideo && (
            <div style={{ width: '100%' }}>
              <video
                src={product.video}
                style={{
                  width: '100%',
                  maxHeight: '300px',
                  objectFit: 'contain',
                  borderRadius: '12px',
                  background: '#f0f0f0'
                }}
                controls
                autoPlay
                playsInline
              />
            </div>
          )}
        </div>

        {/* Product Info - Mobile Optimized */}
        <div style={{
          padding: '20px 18px'
        }}>
          <span style={{
            background: '#FFF0F5',
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

          <h1 style={{
            fontSize: '1.6rem',
            color: '#222',
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
            background: '#FFF9FB',
            padding: '14px',
            borderRadius: '12px',
            border: '1px solid #FFE4EC',
            marginBottom: '18px'
          }}>
            <p style={{
              margin: 0,
              fontSize: '0.9rem',
              color: '#555',
              lineHeight: '1.7'
            }}>
              {product.description}
            </p>
          </div>

          {/* Order Form - Mobile Optimized */}
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
                  border: '2px solid #eee',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                  color: '#333',
                  background: 'white',
                  WebkitAppearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
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
                  border: '2px solid #eee',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                  color: '#333',
                  background: 'white',
                  WebkitAppearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
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
                  border: '2px solid #eee',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.3s',
                  color: '#333',
                  background: 'white',
                  WebkitAppearance: 'none'
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                onBlur={(e) => e.target.style.borderColor = '#eee'}
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
                      border: '2px solid #eee',
                      borderRadius: '12px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s',
                      color: '#333',
                      background: 'white',
                      WebkitAppearance: 'none'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                </div>
                <div style={{
                  flex: 1.5,
                  background: '#FFF0F5',
                  padding: '14px',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1rem', color: '#333' }}>
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

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '20px',
        color: '#888',
        fontSize: '0.8rem',
        maxWidth: '100%',
        margin: '16px auto 0'
      }}>
        <p>🎁 Famous Gifts Hawassa — Made with Love 💕</p>
        <p style={{ fontSize: '0.7rem', opacity: 0.7 }}>Call us: +251 90 949 5969</p>
      </footer>
    </div>
  );
}