
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Upload, Loader2 } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';
import { useToast } from '@/components/ui/use-toast';

const ProductModal = ({ isOpen, onClose, type, onSuccess }) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    creator: '',
    price: '',
    demoLink: '',
    description: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [productFile, setProductFile] = useState(null);

  const handleFileChange = (e, setFile) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = new FormData();
      data.append('name', formData.name);
      data.append('type', type);
      data.append('creator', formData.creator);
      data.append('price', formData.price);
      data.append('description', formData.description);
      
      if (type === 'plugin' && formData.demoLink) {
        data.append('demoLink', formData.demoLink);
      }

      if (imageFile) {
        data.append('images', imageFile);
      }

      if (productFile) {
        const fieldName = type === 'plugin' ? 'pluginFile' : 'mapFile';
        data.append(fieldName, productFile);
      }

      // Add current user as creator if needed, or just use the text field
      // data.append('user', pb.authStore.model.id);

      await pb.collection('products').create(data, { $autoCancel: false });
      
      toast({
        title: "Success",
        description: `${type === 'plugin' ? 'Plugin' : 'Map'} created successfully!`,
      });
      
      onSuccess();
      onClose();
      
      // Reset form
      setFormData({
        name: '',
        creator: '',
        price: '',
        demoLink: '',
        description: ''
      });
      setImageFile(null);
      setProductFile(null);

    } catch (error) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] bg-[#2d2d2d] border-gray-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-cyan-400">
            Add New {type === 'plugin' ? 'Plugin' : 'Map'}
          </DialogTitle>
          <DialogDescription className="text-gray-400">
            Fill in the details to add a new product to the marketplace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-300">Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="bg-[#1a1a1a] border-gray-600 text-white focus:border-cyan-400"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="creator" className="text-gray-300">Creator</Label>
              <Input
                id="creator"
                value={formData.creator}
                onChange={(e) => setFormData({...formData, creator: e.target.value})}
                className="bg-[#1a1a1a] border-gray-600 text-white focus:border-cyan-400"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price" className="text-gray-300">Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({...formData, price: e.target.value})}
              className="bg-[#1a1a1a] border-gray-600 text-white focus:border-cyan-400"
              required
            />
          </div>

          {type === 'plugin' && (
            <div className="space-y-2">
              <Label htmlFor="demoLink" className="text-gray-300">YouTube Demo Link</Label>
              <Input
                id="demoLink"
                value={formData.demoLink}
                onChange={(e) => setFormData({...formData, demoLink: e.target.value})}
                className="bg-[#1a1a1a] border-gray-600 text-white focus:border-cyan-400"
                placeholder="https://youtube.com/..."
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="description" className="text-gray-300">Description</Label>
            <textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="flex min-h-[80px] w-full rounded-md border border-gray-600 bg-[#1a1a1a] px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-300">Cover Image</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-cyan-400 transition-colors cursor-pointer relative bg-[#1a1a1a]">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, setImageFile)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <span className="text-xs text-gray-400">
                  {imageFile ? imageFile.name : "Drop image here"}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-gray-300">{type === 'plugin' ? 'Plugin File (.jar)' : 'Map File (.zip)'}</Label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-4 text-center hover:border-cyan-400 transition-colors cursor-pointer relative bg-[#1a1a1a]">
                <input
                  type="file"
                  onChange={(e) => handleFileChange(e, setProductFile)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-2" />
                <span className="text-xs text-gray-400">
                  {productFile ? productFile.name : "Drop file here"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-cyan-500 hover:bg-cyan-600 text-black font-bold glow-box"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Product'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductModal;
