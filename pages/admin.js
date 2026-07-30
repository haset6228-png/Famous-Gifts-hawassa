import { useState, useEffect } from 'react';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  const [productForm, setProductForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Gifts',
    thumbnail: '',
    images: [],
    video: ''
  });
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (authenticated) {
      loadProducts();
      loadOrders();
    }
  }, [authenticated]);

  const loadProducts = () => {
    const saved = JSON.parse(localStorage.getItem('products') || '[]');
    setProducts(saved);
  };

  const loadOrders = () => {
    const saved = JSON.parse(localStorage.getItem('orders') || '[]');
    setOrders(saved);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'gift123') {
      setAuthenticated(true);
    } else {
      alert('Wrong password!');
    }
  };

  // ========== DIRECT CLOUDINARY UPLOAD (WORKS ON VERCEL) ==========
  const handleFileUpload = async (file, type) => {
    setUploading(true);
    
    try {
      // Create form data for Cloudinary
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'famous_gifts'); // You need to create this in Cloudinary
      formData.append('folder', 'famous-gifts');

      // Upload directly to Cloudinary from browser
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/k94lgst7/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );
      
      const data = await response.json();
      
      if (data.secure_url) {
        const url = data.secure_url;
        if (type === 'thumbnail') {
          setProductForm(prev => ({ ...prev, thumbnail: url }));
        } else if (type === 'image') {
          setProductForm(prev => ({ ...prev, images: [...prev.images, url] }));
        } else if (type === 'video') {
          setProductForm(prev => ({ ...prev, video: url }));
        }
        alert('Upload successful! ✅');
      } else {
        alert('Upload failed: ' + (data.error?.message || 'Unknown error'));
      }
    } catch (error) {
      alert('Upload failed: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index) => {
    const newImages = productForm.images.filter((_, i) => i !== index);
    setProductForm({ ...productForm, images: newImages });
  };

  const handleSubmitProduct = (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newProduct = {
      id: editingId || Date.now().toString(),
      ...productForm,
      price: parseFloat(productForm.price),
      createdAt: new Date().toISOString()
    };

    let updatedProducts;
    if (editingId) {
      updatedProducts = products.map(p => p.id === editingId ? newProduct : p);
    } else {
      updatedProducts = [...products, newProduct];
    }

    localStorage.setItem('products', JSON.stringify(updatedProducts));
    setProducts(updatedProducts);
    resetForm();
    alert(editingId ? 'Product updated successfully!' : 'Product added successfully!');
  };

  const resetForm = () => {
    setProductForm({ name: '', price: '', description: '', category: 'Gifts', thumbnail: '', images: [], video: '' });
    setEditingId(null);
  };

  const deleteProduct = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const updated = products.filter(p => p.id !== id);
      localStorage.setItem('products', JSON.stringify(updated));
      setProducts(updated);
    }
  };

  const editProduct = (product) => {
    setProductForm({
      name: product.name,
      price: product.price.toString(),
      description: product.description,
      category: product.category || 'Gifts',
      thumbnail: product.thumbnail || '',
      images: product.images || [],
      video: product.video || ''
    });
    setEditingId(product.id);
  };

  const updateOrderStatus = (index, newStatus) => {
    const updated = [...orders];
    updated[index].status = newStatus;
    setOrders(updated);
    localStorage.setItem('orders', JSON.stringify(updated));
  };

  if (!authenticated) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '100px auto', 
        textAlign: 'center',
        padding: '40px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#FF1493', marginBottom: '30px' }}>🔐 Admin Login</h2>
        <form onSubmit={handleLogin}>
          <input 
            type="password" 
            placeholder="Enter password" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            style={{ 
              width: '100%', 
              padding: '14px', 
              border: '2px solid #FF69B4', 
              borderRadius: '10px',
              fontSize: '1rem',
              boxSizing: 'border-box'
            }} 
          />
          <button 
            type="submit" 
            style={{ 
              marginTop: '15px', 
              background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
              color: 'white', 
              padding: '14px 40px', 
              border: 'none', 
              borderRadius: '30px', 
              cursor: 'pointer',
              fontSize: '1rem',
              fontWeight: 'bold',
              width: '100%'
            }}
          >
            Login
          </button>
        </form>
        <p style={{ marginTop: '20px', color: '#888' }}>Default password: gift123</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '20px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '30px'
      }}>
        <h1 style={{ margin: 0 }}>🎁 Famous Gifts Admin</h1>
        <button 
          onClick={() => { setAuthenticated(false); setPassword(''); }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid white',
            padding: '10px 20px',
            borderRadius: '10px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '12px 30px',
            background: activeTab === 'products' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : '#f0f0f0',
            color: activeTab === 'products' ? 'white' : '#333',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📦 Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 30px',
            background: activeTab === 'orders' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : '#f0f0f0',
            color: activeTab === 'orders' ? 'white' : '#333',
            border: 'none',
            borderRadius: '10px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          📋 Orders ({orders.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <div>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 5px 25px rgba(255, 105, 180, 0.15)',
            marginBottom: '30px',
            border: '2px solid #FFB6C1'
          }}>
            <h2 style={{ color: '#FF1493', marginBottom: '20px' }}>
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmitProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Price (ETB) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Description *</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                    rows="3"
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '12px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '10px',
                      fontSize: '1rem',
                      boxSizing: 'border-box'
                    }}
                  >
                    <option>Gifts</option>
                    <option>Kitchen</option>
                    <option>Apparel</option>
                    <option>Accessories</option>
                    <option>Home Decor</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Thumbnail Image * (Homepage)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) handleFileUpload(e.target.files[0], 'thumbnail');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '10px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {uploading && <p style={{ color: '#FF1493', fontSize: '0.9rem' }}>⏳ Uploading...</p>}
                  {productForm.thumbnail && (
                    <div style={{ marginTop: '10px' }}>
                      <img src={productForm.thumbnail} alt="Thumbnail" style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '10px', border: '2px solid #FF69B4' }} />
                      <button onClick={() => setProductForm({...productForm, thumbnail: ''})} style={{ marginLeft: '10px', background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Video (Product Page)</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files[0]) handleFileUpload(e.target.files[0], 'video');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '10px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {productForm.video && (
                    <div style={{ marginTop: '10px' }}>
                      <video src={productForm.video} style={{ maxWidth: '100px', maxHeight: '100px', borderRadius: '10px' }} controls />
                      <button onClick={() => setProductForm({...productForm, video: ''})} style={{ marginLeft: '10px', background: '#ff4444', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Gallery Images (Product Page - Multiple)</label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => {
                      if (e.target.files) {
                        for (let file of e.target.files) {
                          handleFileUpload(file, 'image');
                        }
                      }
                    }}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '10px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {productForm.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                      {productForm.images.map((img, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img src={img} alt={`Gallery ${index}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #FF69B4' }} />
                          <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    background: uploading ? '#ccc' : 'linear-gradient(135deg, #FF1493, #FF69B4)',
                    color: 'white',
                    padding: '12px 40px',
                    border: 'none',
                    borderRadius: '30px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {uploading ? '⏳ Uploading...' : (editingId ? 'Update Product' : 'Add Product')}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    style={{
                      background: '#f0f0f0',
                      color: '#333',
                      padding: '12px 40px',
                      border: 'none',
                      borderRadius: '30px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '1rem'
                    }}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '20px',
            boxShadow: '0 5px 25px rgba(255, 105, 180, 0.15)',
            border: '2px solid #FFB6C1'
          }}>
            <h2 style={{ color: '#FF1493', marginBottom: '20px' }}>📦 All Products</h2>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No products added yet. Add your first product above!</p>
            ) : (
              <div style={{ display: 'grid', gap: '15px' }}>
                {products.map((p) => (
                  <div key={p.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '20px',
                    padding: '15px',
                    background: '#FFF0F5',
                    borderRadius: '15px',
                    border: '1px solid #FFB6C1',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flex: '1' }}>
                      {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px' }} />}
                      <div>
                        <h4 style={{ margin: 0, color: '#333' }}>{p.name}</h4>
                        <p style={{ margin: '5px 0', color: '#FF1493', fontWeight: 'bold' }}>ETB {p.price}</p>
                        <p style={{ margin: 0, color: '#666', fontSize: '0.9rem' }}>{p.description}</p>
                        {p.images && <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>{p.images.length} gallery images</p>}
                        {p.video && <p style={{ margin: 0, color: '#888', fontSize: '0.8rem' }}>🎥 Video included</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button
                        onClick={() => editProduct(p)}
                        style={{
                          background: '#FF69B4',
                          color: 'white',
                          border: 'none',
                          padding: '8px 20px',
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => deleteProduct(p.id)}
                        style={{
                          background: '#ff4444',
                          color: 'white',
                          border: 'none',
                          padding: '8px 20px',
                          borderRadius: '10px',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div style={{
          background: 'white',
          padding: '20px',
          borderRadius: '20px',
          boxShadow: '0 5px 25px rgba(255, 105, 180, 0.15)',
          border: '2px solid #FFB6C1'
        }}>
          <h2 style={{ color: '#FF1493', marginBottom: '20px' }}>📋 All Orders</h2>
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '40px' }}>No orders yet. Share your website with customers!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: 'linear-gradient(135deg, #FF1493, #FF69B4)', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '12px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Qty</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Address</th>
                    <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #FFB6C1' }}>
                      <td style={{ padding: '12px' }}>{idx + 1}</td>
                      <td style={{ padding: '12px' }}>{order.name}</td>
                      <td style={{ padding: '12px' }}>{order.phone}</td>
                      <td style={{ padding: '12px' }}>{order.product}</td>
                      <td style={{ padding: '12px' }}>{order.quantity}</td>
                      <td style={{ padding: '12px', color: '#FF1493', fontWeight: 'bold' }}>ETB {order.total}</td>
                      <td style={{ padding: '12px' }}>{order.address}</td>
                      <td style={{ padding: '12px' }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(idx, e.target.value)}
                          style={{
                            padding: '6px 12px',
                            border: '2px solid #FF69B4',
                            borderRadius: '8px',
                            background: 'white',
                            cursor: 'pointer'
                          }}
                        >
                          <option>Pending</option>
                          <option>Called</option>
                          <option>Confirmed</option>
                          <option>Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}