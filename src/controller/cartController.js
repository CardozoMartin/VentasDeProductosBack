// cartController.js
import Cart from '../models/cartModels.js';
import Product from '../models/productModel.js';

export const createCart = async (req, res) => {
  try {
    const cart = new Cart({ items: [], total: 0 });
    await cart.save();
    res.status(201).json(cart);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};



export const getAllCarts = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        let query = {};
        
        // Si se proporcionan fechas, agregar al query
        if (fechaInicio && fechaFin) {
            const inicio = new Date(fechaInicio);
            inicio.setHours(0, 0, 0, 0);
            
            const fin = new Date(fechaFin);
            fin.setHours(23, 59, 59, 999);
            
            query.createdAt = {
                $gte: inicio,
                $lte: fin
            };
        }

        const carts = await Cart.find(query)
            .populate('items.producto')
            .sort({ createdAt: -1 });

        console.log(`Encontradas ${carts.length} ventas`);
        
        res.status(200).json(carts);
    } catch (error) {
        console.error('Error en getAllCarts:', error);
        res.status(500).json({
            message: 'Error al obtener los carritos',
            error: error.message
        });
    }
};

export const getCart = async (req, res) => {
    try {
        const cart = await Cart.findById(req.params.id).populate('items.producto');
        
        if (!cart) {
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }
        
        res.json(cart);
    } catch (error) {
        console.error('Error en getCart:', error);
        res.status(500).json({ message: error.message });
    }
};

export const finalizarCompra = async (req, res) => {
  try {
    const { items } = req.body;
    
    // Verificar stock antes de procesar la compra
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product) {
        return res.status(404).json({ 
          message: `Producto ${item.nombre} no encontrado` 
        });
      }
      if (product.stock < item.cantidad) {
        return res.status(400).json({ 
          message: `Stock insuficiente para ${item.nombre}. Stock disponible: ${product.stock}` 
        });
      }
    }

    // Actualizar stock de productos
    const actualizaciones = items.map(item => {
      return Product.findByIdAndUpdate(
        item.id,
        { $inc: { stock: -item.cantidad } },
        { new: true }
      );
    });

    await Promise.all(actualizaciones);

    // Crear nuevo carrito con los items
    const cart = new Cart({
      items: items.map(item => ({
        producto: item.id,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      total: items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0)
    });

    await cart.save();

    res.status(200).json({ 
      message: 'Compra finalizada con éxito',
      cart 
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

