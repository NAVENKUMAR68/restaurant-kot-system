'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Plus, Trash2, Edit } from 'lucide-react';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    category: string;
    image: string;
}

export default function MenuManagement() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [newItem, setNewItem] = useState({
        name: '',
        description: '',
        price: '',
        category: '',
        image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c', // Default placeholder
    });

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        const res = await fetch('/api/menu');
        const data = await res.json();
        setItems(data);
    };

    const handleCreate = async () => {
        try {
            const res = await fetch('/api/menu', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newItem,
                    price: parseFloat(newItem.price),
                }),
            });

            if (!res.ok) throw new Error('Failed to create item');

            toast.success('Item created successfully');
            setIsOpen(false);
            setNewItem({ name: '', description: '', price: '', category: '', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' });
            fetchMenu();
        } catch (error) {
            toast.error('Error creating item');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-white">Menu Management</h2>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-blue-600 hover:bg-blue-700">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-800 text-white">
                        <DialogHeader>
                            <DialogTitle>Add New Menu Item</DialogTitle>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Name</Label>
                                <Input
                                    value={newItem.name}
                                    onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                            <div className="grid gap-2">
                                <Label>Description</Label>
                                <Input
                                    value={newItem.description}
                                    onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label>Price</Label>
                                    <Input
                                        type="number"
                                        value={newItem.price}
                                        onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
                                        className="bg-slate-800 border-slate-700"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label>Category</Label>
                                    <Input
                                        value={newItem.category}
                                        onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                                        className="bg-slate-800 border-slate-700"
                                        placeholder="e.g. Burgers"
                                    />
                                </div>
                            </div>
                            <div className="grid gap-2">
                                <Label>Image URL</Label>
                                <Input
                                    value={newItem.image}
                                    onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                                    className="bg-slate-800 border-slate-700"
                                />
                            </div>
                        </div>
                        <Button onClick={handleCreate} className="w-full bg-green-600 hover:bg-green-700">
                            Save Item
                        </Button>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                    <Card key={item._id} className="bg-slate-900/50 border-slate-800">
                        <CardHeader>
                            <div className="flex justify-between">
                                <CardTitle className="text-white">{item.name}</CardTitle>
                                <span className="font-bold text-green-400">${item.price}</span>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-slate-400 text-sm">{item.description}</p>
                            <Badge className="mt-2 bg-slate-800 text-slate-300">{item.category}</Badge>
                        </CardContent>
                        <CardFooter className="justify-end gap-2">
                            <Button variant="ghost" size="icon" className="hover:bg-slate-800 text-slate-400">
                                <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" className="hover:bg-red-900/20 text-red-400">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        </div>
    );
}
