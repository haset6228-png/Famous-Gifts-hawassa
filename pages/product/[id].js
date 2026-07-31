import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
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
        console.log('Product data:', data);
        console.log('Images:', data.images);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error loading product:', error);
      setLoading(false);
    }
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
      // Save to Supabase (cloud)
      const { error } = await supabase
        .from('orders')
        .insert([order]);
      
      if (error) throw error;
      
      // Also save to localStorage as backup
      const existing = JSON.parse(localStorage.getItem('orders') || '[]');
      existing.push(order);
      localStorage.setItem('orders', JSON.stringify(existing));
      
      alert('✅ Order placed! We will call ' + form.phone + ' within 24 hours. Thank you for shopping with Famous Gifts Hawassa!');
      setIsSubmitting(false);
      setForm({ name: '', phone: '', address: '', quantity: 1 });
      router.push('/');
    } catch (error) {
      alert('Error placing order: ' + error.message);
      setIsSubmitting(false);
    }
  };

  if (loading) {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      padding: '12px'
    }}>
      {/* Skeleton Navigation */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 16px',
        background: 'rgba(255,255,255,0.95)',
        borderRadius: '12px',
        marginBottom: '16px',
        border: '1px solid rgba(255, 105, 180, 0.1)',
        animation: 'pulse 1.5s ease-in-out infinite'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '36px', height: '36px', background: '#e8e8e8', borderRadius: '50%' }} />
          <div>
            <div style={{ width: '100px', height: '14px', background: '#e8e8e8', borderRadius: '4px', marginBottom: '4px' }} />
            <div style={{ width: '50px', height: '8px', background: '#e8e8e8', borderRadius: '4px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ width: '60px', height: '32px', background: '#e8e8e8', borderRadius: '20px' }} />
          <div style={{ width: '60px', height: '32px', background: '#e8e8e8', borderRadius: '20px' }} />
        </div>
      </div>

      {/* Skeleton Product Detail */}
      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        border: '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        <div style={{
          background: '#fafafa',
          padding: '16px',
          animation: 'pulse 1.5s ease-in-out infinite',
          animationDelay: '0.2s'
        }}>
          {/* Skeleton Image */}
          <div style={{
            width: '100%',
            height: '250px',
            background: '#e8e8e8',
            borderRadius: '12px'
          }} />
        </div>

        {/* Skeleton Product Info */}
        <div style={{ padding: '20px 18px' }}>
          {/* Skeleton Category */}
          <div style={{
            width: '80px',
            height: '20px',
            background: '#e8e8e8',
            borderRadius: '16px',
            marginBottom: '10px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: '0.3s'
          }} />
          
          {/* Skeleton Title */}
          <div style={{
            width: '70%',
            height: '28px',
            background: '#e8e8e8',
            borderRadius: '4px',
            marginBottom: '8px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: '0.4s'
          }} />
          
          {/* Skeleton Price */}
          <div style={{
            width: '40%',
            height: '32px',
            background: '#e8e8e8',
            borderRadius: '4px',
            marginBottom: '15px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: '0.5s'
          }} />
          
          {/* Skeleton Description */}
          <div style={{
            width: '100%',
            height: '80px',
            background: '#e8e8e8',
            borderRadius: '12px',
            marginBottom: '18px',
            animation: 'pulse 1.5s ease-in-out infinite',
            animationDelay: '0.6s'
          }} />
          
          {/* Skeleton Form */}
          <div style={{ display: 'grid', gap: '10px' }}>
            <div style={{
              width: '100%',
              height: '48px',
              background: '#e8e8e8',
              borderRadius: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.7s'
            }} />
            <div style={{
              width: '100%',
              height: '48px',
              background: '#e8e8e8',
              borderRadius: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.8s'
            }} />
            <div style={{
              width: '100%',
              height: '48px',
              background: '#e8e8e8',
              borderRadius: '12px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '0.9s'
            }} />
            <div style={{
              width: '100%',
              height: '56px',
              background: '#e8e8e8',
              borderRadius: '14px',
              animation: 'pulse 1.5s ease-in-out infinite',
              animationDelay: '1s'
            }} />
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

  // FIX: Properly handle images array
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
      background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4EC 50%, #FFD6E5 100%)',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
      padding: '12px'
    }}>
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

      <div style={{
        maxWidth: '100%',
        margin: '0 auto',
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: '0 5px 30px rgba(0,0,0,0.06)',
        border: '1px solid rgba(255, 105, 180, 0.1)'
      }}>
        <div style={{
          background: '#fafafa',
          padding: '16px',
        }}>
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
                        onError={(e) => {
                          console.log('Thumbnail failed to load:', img);
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

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