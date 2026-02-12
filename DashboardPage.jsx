
import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Trash2, Edit, Plus, RefreshCw, UserPlus } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

const DashboardPage = () => {
  const { t } = useLanguage();
  const { currentUser } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Admin Add Products State
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedProducts, setSelectedProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'plugin',
    creator: '',
    price: 0,
    description: '',
    demoLink: '',
    featured: false
  });

  useEffect(() => {
    fetchProducts();
    fetchUsers();
  }, []);

  const fetchProducts = async () => {
    try {
      const result = await pb.collection('products').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setProducts(result);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const result = await pb.collection('users').getFullList({
        sort: '-created',
        $autoCancel: false
      });
      setUsers(result);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingProduct) {
        await pb.collection('products').update(editingProduct.id, formData, { $autoCancel: false });
        toast({
          title: t('success'),
          description: t('productUpdated'),
        });
      } else {
        await pb.collection('products').create(formData, { $autoCancel: false });
        toast({
          title: t('success'),
          description: t('productAdded'),
        });
      }
      
      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        type: 'plugin',
        creator: '',
        price: 0,
        description: '',
        demoLink: '',
        featured: false
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      type: product.type,
      creator: product.creator,
      price: product.price,
      description: product.description || '',
      demoLink: product.demoLink || '',
      featured: product.featured || false
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDelete'))) {
      return;
    }

    try {
      await pb.collection('products').delete(id, { $autoCancel: false });
      toast({
        title: t('success'),
        description: t('productDeleted'),
      });
      fetchProducts();
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
    }
  };

  const handleResetPurchases = async () => {
    if (!window.confirm(t('resetConfirm'))) return;
    
    setLoading(true);
    try {
      // 1. Delete all orders
      const orders = await pb.collection('orders').getFullList({ $autoCancel: false });
      await Promise.all(orders.map(o => pb.collection('orders').delete(o.id, { $autoCancel: false })));

      // 2. Delete all downloads
      const downloads = await pb.collection('downloads').getFullList({ $autoCancel: false });
      await Promise.all(downloads.map(d => pb.collection('downloads').delete(d.id, { $autoCancel: false })));

      // 3. Reset users (role -> user, cagnotte -> 0)
      // Only reset clients, keep admins
      const clients = users.filter(u => u.role === 'client');
      await Promise.all(clients.map(u => pb.collection('users').update(u.id, {
        role: 'user',
        cagnotte: 0
      }, { $autoCancel: false })));

      toast({
        title: t('success'),
        description: t('resetSuccess'),
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddProductsToUser = async () => {
    if (!selectedUser || selectedProducts.length === 0) {
      toast({ title: t('error'), description: 'Please select user and products', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const user = users.find(u => u.id === selectedUser);
      
      // Create orders and downloads
      const promises = selectedProducts.map(async (productId) => {
        const product = products.find(p => p.id === productId);
        
        // Create Order
        await pb.collection('orders').create({
          userId: selectedUser,
          productId: productId,
          productName: product.name,
          price: product.price,
          paymentStatus: 'completed',
          paymentMethod: 'admin_added', // or manual
          type: 'admin_added',
          purchaseDate: new Date().toISOString()
        }, { $autoCancel: false });

        // Create Download
        let fileUrl = product.download_url || '';
        if (!fileUrl && product.pluginFile) fileUrl = pb.files.getUrl(product, product.pluginFile);
        if (!fileUrl && product.mapFile) fileUrl = pb.files.getUrl(product, product.mapFile);

        await pb.collection('downloads').create({
          userId: selectedUser,
          productId: productId,
          productName: product.name,
          downloadDate: new Date().toISOString(),
          fileUrl: fileUrl
        }, { $autoCancel: false });
      });

      await Promise.all(promises);

      // Update user role if needed
      if (user.role === 'user') {
        await pb.collection('users').update(selectedUser, { role: 'client' }, { $autoCancel: false });
      }

      toast({
        title: t('success'),
        description: t('productsAdded'),
      });
      
      setSelectedUser('');
      setSelectedProducts([]);
      fetchUsers();
    } catch (error) {
      toast({
        title: t('error'),
        description: error.message,
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleProductSelection = (productId) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(prev => prev.filter(id => id !== productId));
    } else {
      setSelectedProducts(prev => [...prev, productId]);
    }
  };

  if (loading && products.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <p className="text-xl text-gray-600">{t('loading')}</p>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>{`${t('dashboard')} - GoldenShop`}</title>
        <meta name="description" content={t('adminPanel')} />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900">{t('adminPanel')}</h1>
            <div className="flex gap-4">
              <Button
                onClick={handleResetPurchases}
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                {t('resetPurchases')}
              </Button>
              <Button
                onClick={() => {
                  setShowForm(!showForm);
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    type: 'plugin',
                    creator: '',
                    price: 0,
                    description: '',
                    demoLink: '',
                    featured: false
                  });
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                {t('addProduct')}
              </Button>
            </div>
          </div>

          {/* Admin Add Products Section */}
          <Card className="mb-8 border-blue-200 bg-blue-50/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-600" />
                {t('addProductsToUser')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>{t('selectUser')}</Label>
                  <select 
                    className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm"
                    value={selectedUser}
                    onChange={(e) => setSelectedUser(e.target.value)}
                  >
                    <option value="">{t('selectUser')}</option>
                    {users.map(u => (
                      <option key={u.id} value={u.id}>{u.email} ({u.role})</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <Label className="mb-2 block">{t('selectProducts')}</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded-md p-4 bg-white">
                    {products.map(p => (
                      <div key={p.id} className="flex items-center gap-2">
                        <input 
                          type="checkbox" 
                          id={`prod-${p.id}`}
                          checked={selectedProducts.includes(p.id)}
                          onChange={() => toggleProductSelection(p.id)}
                          className="w-4 h-4"
                        />
                        <label htmlFor={`prod-${p.id}`} className="text-sm cursor-pointer">{p.name}</label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleAddProductsToUser}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                  disabled={!selectedUser || selectedProducts.length === 0}
                >
                  {t('save')}
                </Button>
              </div>
            </CardContent>
          </Card>

          {showForm && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>
                  {editingProduct ? t('editProduct') : t('addProduct')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t('productName')}</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">{t('productType')}</Label>
                      <select
                        id="type"
                        value={formData.type}
                        onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                        required
                      >
                        <option value="plugin">Plugin</option>
                        <option value="map">Map</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="creator">{t('creator')}</Label>
                      <Input
                        id="creator"
                        value={formData.creator}
                        onChange={(e) => setFormData({ ...formData, creator: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="price">{t('price')}</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="demoLink">{t('demoLink')}</Label>
                      <Input
                        id="demoLink"
                        value={formData.demoLink}
                        onChange={(e) => setFormData({ ...formData, demoLink: e.target.value })}
                      />
                    </div>

                    <div className="space-y-2 flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="featured">{t('featured')}</Label>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">{t('description')}</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="flex min-h-[80px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900"
                      rows={3}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" className="bg-green-600 hover:bg-green-700 text-white">
                      {t('save')}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingProduct(null);
                      }}
                    >
                      {t('cancel')}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {product.name}
                        {product.featured && (
                          <span className="ml-2 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                            {t('featured')}
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">
                        {t('productType')}: {product.type}
                      </p>
                      <p className="text-sm text-gray-600 mb-1">
                        {t('creator')}: {product.creator}
                      </p>
                      <p className="text-lg font-bold text-green-600 mb-2">
                        ${product.price}
                      </p>
                      {product.description && (
                        <p className="text-sm text-gray-700">{product.description}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(product)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(product.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
