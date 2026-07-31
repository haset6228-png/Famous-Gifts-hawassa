import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);

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

  // LOAD PRODUCTS FROM SUPABASE
  const loadProducts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
      alert('Error loading products: ' + error.message);
    }
    setLoading(false);
  };

  // LOAD ORDERS FROM SUPABASE
  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'gift123') {
      setAuthenticated(true);
    } else {
      alert('Wrong password!');
    }
  };

  // CLOUDINARY UPLOAD (Direct from browser)
  const handleFileUpload = async (file, type) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'famous_gifts');
      formData.append('folder', 'famous-gifts');

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

  // SAVE PRODUCT TO SUPABASE
  const handleSubmitProduct = async (e) => {
    e.preventDefault();
    if (!productForm.name || !productForm.price || !productForm.description) {
      alert('Please fill in all required fields');
      return;
    }

    const newProduct = {
  id: editingId || Date.now().toString(),
  name: productForm.name,
  price: parseFloat(productForm.price),
  description: productForm.description,
  category: productForm.category,
  thumbnail: productForm.thumbnail || '',
  images: Array.isArray(productForm.images) ? productForm.images : [],
  video: productForm.video || '',
  createdAt: new Date().toISOString()
};

    try {
      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(newProduct)
          .eq('id', editingId);
        
        if (error) throw error;
        alert('Product updated successfully!');
      } else {
        const { error } = await supabase
          .from('products')
          .insert([newProduct]);
        
        if (error) throw error;
        alert('Product added successfully!');
      }
      
      resetForm();
      loadProducts();
    } catch (error) {
      alert('Error saving product: ' + error.message);
    }
  };

  const resetForm = () => {
    setProductForm({ name: '', price: '', description: '', category: 'Gifts', thumbnail: '', images: [], video: '' });
    setEditingId(null);
  };

  const deleteProduct = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        const { error } = await supabase
          .from('products')
          .delete()
          .eq('id', id);
        
        if (error) throw error;
        loadProducts();
      } catch (error) {
        alert('Error deleting product: ' + error.message);
      }
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

  // UPDATE ORDER STATUS IN SUPABASE
  const updateOrderStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      loadOrders();
    } catch (error) {
      alert('Error updating order: ' + error.message);
    }
  };

  if (!authenticated) {
    return (
      <div style={{ 
        maxWidth: '400px', 
        margin: '50px auto', 
        textAlign: 'center',
        padding: '30px',
        background: 'white',
        borderRadius: '20px',
        boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ color: '#FF1493', marginBottom: '20px' }}>🔐 Admin Login</h2>
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
        <p style={{ marginTop: '15px', color: '#888' }}>Default password: gift123</p>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '1400px', 
      margin: '0 auto', 
      padding: '15px',
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '15px 20px',
        background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
        borderRadius: '15px',
        color: 'white',
        marginBottom: '20px'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.3rem' }}>🎁 Famous Gifts Admin</h1>
        <button 
          onClick={() => { setAuthenticated(false); setPassword(''); }}
          style={{
            background: 'rgba(255,255,255,0.2)',
            color: 'white',
            border: '1px solid white',
            padding: '8px 16px',
            borderRadius: '8px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'products' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : '#f0f0f0',
            color: activeTab === 'products' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          📦 Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'orders' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : '#f0f0f0',
            color: activeTab === 'orders' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          📋 Orders ({orders.length})
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#FF1493' }}>⏳ Loading...</p>}

      {activeTab === 'products' && (
        <div>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
            marginBottom: '20px',
            border: '2px solid #FFB6C1'
          }}>
            <h2 style={{ color: '#FF1493', marginBottom: '15px', fontSize: '1.2rem' }}>
              {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
            </h2>
            <form onSubmit={handleSubmitProduct}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '0.9rem' }}>Product Name *</label>
                  <input
                    type="text"
                    value={productForm.name}
                    onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '0.9rem' }}>Price (ETB) *</label>
                  <input
                    type="number"
                    value={productForm.price}
                    onChange={(e) => setProductForm({...productForm, price: e.target.value})}
                    required
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '0.9rem' }}>Description *</label>
                  <textarea
                    value={productForm.description}
                    onChange={(e) => setProductForm({...productForm, description: e.target.value})}
                    required
                    rows="2"
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
                      boxSizing: 'border-box',
                      resize: 'vertical'
                    }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '0.9rem' }}>Category</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '8px',
                      fontSize: '0.9rem',
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
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '0.9rem' }}>Thumbnail *</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files[0]) handleFileUpload(e.target.files[0], 'thumbnail');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {uploading && <p style={{ color: '#FF1493', fontSize: '0.8rem' }}>⏳ Uploading...</p>}
                  {productForm.thumbnail && (
                    <div style={{ marginTop: '8px' }}>
                      <img src={productForm.thumbnail} alt="Thumbnail" style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px', border: '2px solid #FF69B4' }} />
                      <button onClick={() => setProductForm({...productForm, thumbnail: ''})} style={{ marginLeft: '8px', background: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                    </div>
                  )}
                </div>
                <div>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '0.9rem' }}>Video</label>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      if (e.target.files[0]) handleFileUpload(e.target.files[0], 'video');
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {productForm.video && (
                    <div style={{ marginTop: '8px' }}>
                      <video src={productForm.video} style={{ maxWidth: '80px', maxHeight: '80px', borderRadius: '8px' }} controls />
                      <button onClick={() => setProductForm({...productForm, video: ''})} style={{ marginLeft: '8px', background: '#ff4444', color: 'white', border: 'none', padding: '4px 8px', borderRadius: '5px', cursor: 'pointer', fontSize: '0.8rem' }}>Remove</button>
                    </div>
                  )}
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333', fontSize: '0.9rem' }}>Gallery Images</label>
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
                      padding: '8px',
                      border: '2px solid #FFB6C1',
                      borderRadius: '8px',
                      boxSizing: 'border-box'
                    }}
                  />
                  {productForm.images.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                      {productForm.images.map((img, index) => (
                        <div key={index} style={{ position: 'relative' }}>
                          <img src={img} alt={`Gallery ${index}`} style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', border: '2px solid #FF69B4' }} />
                          <button onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ff4444', color: 'white', border: 'none', borderRadius: '50%', width: '18px', height: '18px', cursor: 'pointer', fontSize: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{
                    background: uploading ? '#ccc' : 'linear-gradient(135deg, #FF1493, #FF69B4)',
                    color: 'white',
                    padding: '10px 30px',
                    border: 'none',
                    borderRadius: '25px',
                    cursor: uploading ? 'not-allowed' : 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.9rem'
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
                      padding: '10px 30px',
                      border: 'none',
                      borderRadius: '25px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                      fontSize: '0.9rem'
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
            padding: '15px',
            borderRadius: '16px',
            boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
            border: '2px solid #FFB6C1'
          }}>
            <h2 style={{ color: '#FF1493', marginBottom: '15px', fontSize: '1.2rem' }}>📦 All Products</h2>
            {products.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>No products added yet.</p>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                {products.map((p) => (
                  <div key={p.id} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '15px',
                    padding: '12px',
                    background: '#FFF0F5',
                    borderRadius: '12px',
                    border: '1px solid #FFB6C1',
                    flexWrap: 'wrap'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1' }}>
                      {p.thumbnail && <img src={p.thumbnail} alt={p.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '8px' }} />}
                      <div>
                        <h4 style={{ margin: 0, color: '#333', fontSize: '0.95rem' }}>{p.name}</h4>
                        <p style={{ margin: '3px 0', color: '#FF1493', fontWeight: 'bold', fontSize: '0.85rem' }}>ETB {p.price}</p>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => editProduct(p)}
                        style={{
                          background: '#FF69B4',
                          color: 'white',
                          border: 'none',
                          padding: '6px 15px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
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
                          padding: '6px 15px',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontSize: '0.8rem'
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
          padding: '15px',
          borderRadius: '16px',
          boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
          border: '2px solid #FFB6C1'
        }}>
          <h2 style={{ color: '#FF1493', marginBottom: '15px', fontSize: '1.2rem' }}>📋 All Orders</h2>
          {orders.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>No orders yet. Share your website with customers!</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead style={{ background: 'linear-gradient(135deg, #FF1493, #FF69B4)', color: 'white' }}>
                  <tr>
                    <th style={{ padding: '10px', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Customer</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Phone</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Product</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Qty</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Total</th>
                    <th style={{ padding: '10px', textAlign: 'left' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid #FFB6C1' }}>
                      <td style={{ padding: '10px' }}>{idx + 1}</td>
                      <td style={{ padding: '10px' }}>{order.name}</td>
                      <td style={{ padding: '10px' }}>{order.phone}</td>
                      <td style={{ padding: '10px' }}>{order.product}</td>
                      <td style={{ padding: '10px' }}>{order.quantity}</td>
                      <td style={{ padding: '10px', color: '#FF1493', fontWeight: 'bold' }}>ETB {order.total}</td>
                      <td style={{ padding: '10px' }}>
                        <select
                          value={order.status}
                          onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                          style={{
                            padding: '4px 10px',
                            border: '2px solid #FF69B4',
                            borderRadius: '6px',
                            background: 'white',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
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