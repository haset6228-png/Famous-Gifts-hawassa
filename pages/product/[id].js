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
      padding: '20px'
    }}>
      {/* Navigation */}
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '15px 30px',
        background: 'rgba(255,255,255,0.9)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        boxShadow: '0 2px 30px rgba(255, 105, 180, 0.1)',
        maxWidth: '1200px',
        margin: '0 auto 30px',
        border: '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }} onClick={() => router.push('/')}>
          <span style={{ fontSize: '1.8rem' }}>🎁</span>
          <div>
            <h1 style={{ color: '#FF1493', margin: 0, fontSize: '1.3rem', fontWeight: '700' }}>Famous Gifts</h1>
            <p style={{ color: '#FF69B4', margin: 0, fontSize: '0.6rem', letterSpacing: '2px' }}>HAWASSA</p>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => router.push('/')}
            style={{
              color: '#FF1493',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.9rem',
              padding: '8px 20px',
              borderRadius: '25px',
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
              gap: '6px',
              background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
              color: 'white',
              padding: '8px 18px',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '600',
              fontSize: '0.85rem',
              boxShadow: '0 5px 20px rgba(255, 20, 147, 0.3)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = 'scale(1.05)';
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = 'scale(1)';
            }}
          >
            <span>📞</span> Call
          </a>
        </div>
      </nav>

      {/* Product Detail */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'white',
        borderRadius: '24px',
        overflow: 'hidden',
        boxShadow: '0 10px 50px rgba(0,0,0,0.08)',
        border: '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '0',
          minHeight: '500px'
        }}>
          {/* Left - Image/Video Gallery */}
          <div style={{
            background: '#fafafa',
            padding: '40px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center'
          }}>
            {/* Tab Switcher */}
            {hasVideo && images.length > 0 && (
              <div style={{
                display: 'flex',
                gap: '10px',
                marginBottom: '20px',
                background: 'white',
                padding: '5px',
                borderRadius: '12px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
              }}>
                <button
                  onClick={() => setActiveTab('photos')}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'photos' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : 'transparent',
                    color: activeTab === 'photos' ? 'white' : '#666',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}
                >
                  Photos ({images.length})
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  style={{
                    padding: '8px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: activeTab === 'video' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : 'transparent',
                    color: activeTab === 'video' ? 'white' : '#666',
                    cursor: 'pointer',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    transition: 'all 0.3s'
                  }}
                >
                  Video
                </button>
              </div>
            )}

            {/* Photos Tab */}
            {activeTab === 'photos' && (
              <>
                <div style={{ width: '100%', marginBottom: '15px' }}>
                  {images.length > 0 ? (
                    <img
                      src={images[selectedImage]}
                      alt={product.name}
                      style={{
                        width: '100%',
                        maxHeight: '450px',
                        objectFit: 'contain',
                        borderRadius: '16px',
                        boxShadow: '0 5px 30px rgba(0,0,0,0.05)'
                      }}
                    />
                  ) : (
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      height: '400px',
                      fontSize: '8rem',
                      background: '#FFF0F5',
                      borderRadius: '16px'
                    }}>
                      🎁
                    </div>
                  )}
                </div>

                {images.length > 1 && (
                  <div style={{
                    display: 'flex',
                    gap: '10px',
                    overflowX: 'auto',
                    width: '100%',
                    padding: '5px 0'
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
                          border: selectedImage === index ? '3px solid #FF1493' : '3px solid transparent',
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
                    maxHeight: '450px',
                    objectFit: 'contain',
                    borderRadius: '16px',
                    background: '#f0f0f0'
                  }}
                  controls
                  autoPlay
                  playsInline
                />
              </div>
            )}
          </div>

          {/* Right - Product Info */}
          <div style={{
            padding: '50px 45px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <span style={{
              background: '#FFF0F5',
              padding: '4px 16px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              color: '#FF1493',
              fontWeight: '600',
              display: 'inline-block',
              width: 'fit-content',
              marginBottom: '15px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase'
            }}>
              {product.category || 'Gifts'}
            </span>

            <h1 style={{
              fontSize: '2.5rem',
              color: '#222',
              margin: '0 0 10px 0',
              fontWeight: '700',
              lineHeight: '1.2'
            }}>
              {product.name}
            </h1>

            <p style={{
              fontSize: '2.2rem',
              fontWeight: '700',
              color: '#FF1493',
              margin: '5px 0 20px 0'
            }}>
              ETB {product.price.toLocaleString()}
            </p>

            <div style={{
              background: '#FFF9FB',
              padding: '20px',
              borderRadius: '14px',
              border: '1px solid #FFE4EC',
              marginBottom: '25px'
            }}>
              <p style={{
                margin: 0,
                fontSize: '1rem',
                color: '#555',
                lineHeight: '1.8'
              }}>
                {product.description}
              </p>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gap: '12px' }}>
                <input
                  type="text"
                  placeholder="Your full name"
                  value={form.name}
                  onChange={(e) => setForm({...form, name: e.target.value})}
                  required
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    border: '2px solid #eee',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s',
                    color: '#333',
                    background: '#fafafa'
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
                    padding: '14px 16px',
                    border: '2px solid #eee',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s',
                    color: '#333',
                    background: '#fafafa'
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
                    padding: '14px 16px',
                    border: '2px solid #eee',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box',
                    transition: 'border-color 0.3s',
                    color: '#333',
                    background: '#fafafa'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                  onBlur={(e) => e.target.style.borderColor = '#eee'}
                />
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <input
                    type="number"
                    placeholder="Qty"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({...form, quantity: parseInt(e.target.value)})}
                    required
                    style={{
                      width: '100%',
                      padding: '14px 16px',
                      border: '2px solid #eee',
                      borderRadius: '12px',
                      fontSize: '0.95rem',
                      boxSizing: 'border-box',
                      transition: 'border-color 0.3s',
                      color: '#333',
                      background: '#fafafa'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#FF69B4'}
                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                  />
                  <div style={{
                    background: '#FFF0F5',
                    padding: '14px',
                    borderRadius: '12px',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <span style={{ fontSize: '1.1rem', color: '#333' }}>
                      <strong>Total:</strong> ETB {(product.price * form.quantity).toLocaleString()}
                    </span>
                  </div>
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
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
                    marginTop: '5px'
                  }}
                >
                  {isSubmitting ? 'Processing...' : 'Place Order'}
                </motion.button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <footer style={{
        textAlign: 'center',
        padding: '30px',
        color: '#888',
        fontSize: '0.9rem',
        maxWidth: '1200px',
        margin: '30px auto 0'
      }}>
        <p> Famous Gifts Hawassa — Made with Love</p>
        <p style={{ fontSize: '0.8rem', opacity: 0.7 }}>Call us: +251 90 949 5969</p>
      </footer>
    </div>
  );
}