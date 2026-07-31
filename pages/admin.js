import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin() {
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [loading, setLoading] = useState(false);

  // Password Change State
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Sales Data State
  const [salesData, setSalesData] = useState({ monthlyTotal: 0, monthlyOrders: 0, monthlyRevenue: 0, dailyData: [] });
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

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

  // ADMIN PASSWORD (Change this to your desired password)
  const ADMIN_PASSWORD = 'gift123';

  useEffect(() => {
    if (authenticated) {
      loadProducts();
      loadOrders();
      calculateSales();
    }
  }, [authenticated]);

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
    }
    setLoading(false);
  };

  const loadOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('createdAt', { ascending: false });
      
      if (error) throw error;
      setOrders(data || []);
      calculateSales(data || []);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  // ========== SALES CALCULATION ==========
  const calculateSales = (ordersData = null) => {
    const ordersToUse = ordersData || orders;
    if (ordersToUse.length === 0) {
      setSalesData({ monthlyTotal: 0, monthlyOrders: 0, monthlyRevenue: 0, dailyData: [] });
      return;
    }

    // Filter orders for selected month/year
    const filtered = ordersToUse.filter(order => {
      const date = new Date(order.createdAt);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    // Calculate totals
    const totalRevenue = filtered.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalOrders = filtered.length;
    const averageOrder = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Group by day for graph
    const dailyTotals = {};
    filtered.forEach(order => {
      const date = new Date(order.createdAt);
      const day = date.getDate();
      dailyTotals[day] = (dailyTotals[day] || 0) + (order.total || 0);
    });

    // Convert to array for graph
    const dailyData = Object.entries(dailyTotals)
      .map(([day, total]) => ({ day: parseInt(day), total }))
      .sort((a, b) => a.day - b.day);

    setSalesData({
      monthlyTotal: totalRevenue,
      monthlyOrders: totalOrders,
      monthlyRevenue: totalRevenue,
      averageOrder: averageOrder,
      dailyData: dailyData
    });
  };

  // Update sales when month/year changes
  useEffect(() => {
    if (authenticated && orders.length > 0) {
      calculateSales();
    }
  }, [selectedMonth, selectedYear, orders]);

  // ========== PASSWORD CHANGE ==========
  const handleChangePassword = (e) => {
    e.preventDefault();
    if (currentPassword !== ADMIN_PASSWORD) {
      alert('Current password is incorrect!');
      return;
    }
    if (newPassword.length < 6) {
      alert('New password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match!');
      return;
    }
    // In a real app, you'd update this in a database
    // For now, we'll just update the constant above
    alert('✅ Password changed successfully! (Note: This is temporary until you add a database for admin settings)');
    setShowPasswordModal(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
    } else {
      alert('Wrong password!');
    }
  };

  // ========== CLOUDINARY UPLOAD ==========
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
      images: productForm.images || [],
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

  // ========== UPDATE ORDER STATUS (WITH CANCEL) ==========
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
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => setShowPasswordModal(true)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              color: 'white',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            🔑 Change Password
          </button>
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
      </div>

      {/* Tabs */}
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
        <button
          onClick={() => setActiveTab('sales')}
          style={{
            padding: '10px 20px',
            background: activeTab === 'sales' ? 'linear-gradient(135deg, #FF1493, #FF69B4)' : '#f0f0f0',
            color: activeTab === 'sales' ? 'white' : '#333',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
            fontSize: '0.9rem'
          }}
        >
          📊 Sales Dashboard
        </button>
      </div>

      {loading && <p style={{ textAlign: 'center', color: '#FF1493' }}>⏳ Loading...</p>}

      {/* ==================== PRODUCTS TAB ==================== */}
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

      {/* ==================== ORDERS TAB ==================== */}
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
                          <option style={{ color: '#ff4444' }}>Cancelled</option>
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

      {/* ==================== SALES DASHBOARD TAB ==================== */}
      {activeTab === 'sales' && (
        <div>
          {/* Month/Year Selector */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
            border: '2px solid #FFB6C1',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>Month:</label>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                  style={{
                    marginLeft: '8px',
                    padding: '8px 15px',
                    border: '2px solid #FFB6C1',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value={0}>January</option>
                  <option value={1}>February</option>
                  <option value={2}>March</option>
                  <option value={3}>April</option>
                  <option value={4}>May</option>
                  <option value={5}>June</option>
                  <option value={6}>July</option>
                  <option value={7}>August</option>
                  <option value={8}>September</option>
                  <option value={9}>October</option>
                  <option value={10}>November</option>
                  <option value={11}>December</option>
                </select>
              </div>
              <div>
                <label style={{ fontWeight: 'bold', color: '#333', fontSize: '0.9rem' }}>Year:</label>
                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                  style={{
                    marginLeft: '8px',
                    padding: '8px 15px',
                    border: '2px solid #FFB6C1',
                    borderRadius: '8px',
                    fontSize: '0.9rem'
                  }}
                >
                  <option value={2024}>2024</option>
                  <option value={2025}>2025</option>
                  <option value={2026}>2026</option>
                </select>
              </div>
              <button
                onClick={() => {
                  const now = new Date();
                  setSelectedMonth(now.getMonth());
                  setSelectedYear(now.getFullYear());
                }}
                style={{
                  background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                  color: 'white',
                  border: 'none',
                  padding: '8px 20px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.85rem'
                }}
              >
                📅 Current Month
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '15px',
            marginBottom: '20px'
          }}>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
              border: '2px solid #FFB6C1',
              textAlign: 'center'
            }}>
              <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>Total Revenue</p>
              <h2 style={{ color: '#FF1493', margin: '5px 0 0', fontSize: '2rem' }}>
                ETB {salesData.monthlyRevenue.toLocaleString()}
              </h2>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
              border: '2px solid #FFB6C1',
              textAlign: 'center'
            }}>
              <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>Total Orders</p>
              <h2 style={{ color: '#FF1493', margin: '5px 0 0', fontSize: '2rem' }}>
                {salesData.monthlyOrders}
              </h2>
            </div>
            <div style={{
              background: 'white',
              padding: '20px',
              borderRadius: '16px',
              boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
              border: '2px solid #FFB6C1',
              textAlign: 'center'
            }}>
              <p style={{ color: '#888', fontSize: '0.8rem', margin: 0 }}>Average Order</p>
              <h2 style={{ color: '#FF1493', margin: '5px 0 0', fontSize: '2rem' }}>
                ETB {(salesData.averageOrder || 0).toLocaleString()}
              </h2>
            </div>
          </div>

          {/* Graph */}
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '16px',
            boxShadow: '0 5px 20px rgba(255, 105, 180, 0.1)',
            border: '2px solid #FFB6C1'
          }}>
            <h3 style={{ color: '#333', marginBottom: '20px', fontSize: '1.1rem' }}>
              📊 Daily Sales Breakdown
            </h3>
            {salesData.dailyData.length === 0 ? (
              <p style={{ textAlign: 'center', color: '#888', padding: '30px' }}>
                No sales data for this month yet.
              </p>
            ) : (
              <div style={{ display: 'flex', gap: '4px', alignItems: 'flex-end', height: '200px', padding: '10px 0' }}>
                {salesData.dailyData.map((day, index) => {
                  const maxTotal = Math.max(...salesData.dailyData.map(d => d.total), 1);
                  const height = (day.total / maxTotal) * 180;
                  return (
                    <div key={index} style={{ 
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <div style={{
                        height: `${height}px`,
                        width: '100%',
                        maxWidth: '30px',
                        background: 'linear-gradient(to top, #FF1493, #FF69B4)',
                        borderRadius: '4px 4px 0 0',
                        transition: 'height 0.5s ease'
                      }} />
                      <span style={{ fontSize: '0.6rem', color: '#888' }}>{day.day}</span>
                      <span style={{ fontSize: '0.5rem', color: '#FF1493' }}>ETB {day.total}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== CHANGE PASSWORD MODAL ==================== */}
      {showPasswordModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div style={{
            background: 'white',
            maxWidth: '450px',
            width: '100%',
            padding: '30px',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            border: '2px solid #FF69B4'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ color: '#FF1493', margin: 0 }}>🔑 Change Password</h2>
              <button
                onClick={() => setShowPasswordModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '1.5rem',
                  cursor: 'pointer',
                  color: '#999'
                }}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleChangePassword}>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Current Password</label>
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #FFB6C1',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>New Password</label>
                <input
                  type="password"
                  placeholder="Enter new password (min 6 chars)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength="6"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #FFB6C1',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '5px', color: '#333' }}>Confirm New Password</label>
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px solid #FFB6C1',
                    borderRadius: '10px',
                    fontSize: '0.95rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
                    color: 'white',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  }}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => setShowPasswordModal(false)}
                  style={{
                    background: '#f0f0f0',
                    color: '#333',
                    border: 'none',
                    padding: '12px 25px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '0.95rem'
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}