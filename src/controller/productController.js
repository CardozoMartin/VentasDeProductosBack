import Product from '../models/productModel.js';

// Obtener productos paginados
export const getProducts = async (req, res) => {
  try {
    // Obtener el número de página desde la query (por defecto: 1)
    const page = parseInt(req.query.page) || 1;
    // Cantidad de productos por página
    const limit = parseInt(req.query.limit) || 10;
    
    // Calcular el número de documentos a saltar
    const skip = (page - 1) * limit;
    
    // Obtener el total de productos para calcular el total de páginas
    const totalProducts = await Product.countDocuments();
    const totalPages = Math.ceil(totalProducts / limit);
    
    // Obtener los productos paginados
    const productos = await Product.find()
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 }); // Ordenar por fecha de creación (más reciente primero)
    

     
    // Preparar la respuesta con metadata de paginación
    res.json({
      success: true,
      data: productos,
      pagination: {
        currentPage: page,
        totalPages,
        totalProducts,
        productsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: error.message 
    });
  }
};

// El resto de los controladores permanecen igual...
export const getProductById = async (req, res) => {
  try {
    const producto = await Product.findById(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createProduct = async (req, res) => {
  try {
    const producto = new Product(req.body);
    const nuevoProducto = await producto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateProduct = async (req, res) => {
  try {
    const producto = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const deleteProduct = async (req, res) => {
  try {
    const producto = await Product.findByIdAndDelete(req.params.id);
    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const buscarProductos = async (req, res) => {
  try {
    const { termino, page = 1, limit = 10 } = req.query;
    
    if (!termino) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un término de búsqueda'
      });
    }
    
    // Sanitizar el término de búsqueda
    const terminoSanitizado = termino.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(terminoSanitizado, 'i');
    
    // Calcular skip para paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    // Realizar la búsqueda con paginación
    const productos = await Product.find({
      $or: [
        { nombre: regex },
        { descripcion: regex },
        { categoria: regex },
        { codigoBarras: regex }
      ]
    })
    .select('nombre descripcion precio stock codigoBarras categoria')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ createdAt: -1 });
    
    // Obtener el total de productos que coinciden con la búsqueda
    const totalProducts = await Product.countDocuments({
      $or: [
        { nombre: regex },
        { descripcion: regex },
        { categoria: regex },
        { codigoBarras: regex }
      ]
    });
    
    const totalPages = Math.ceil(totalProducts / parseInt(limit));
    
    res.status(200).json({
      success: true,
      data: productos,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalProducts,
        productsPerPage: parseInt(limit),
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Error en buscarProductos:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al buscar productos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};