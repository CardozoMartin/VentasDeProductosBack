// ventasController.js
import Cart from '../models/cartModels.js';

export const getVentasReporte = async (req, res) => {
    try {
        const { fechaInicio, fechaFin } = req.query;
        
        // Crear fechas con hora inicio y fin del día
        const inicio = new Date(fechaInicio);
        inicio.setHours(0, 0, 0, 0);
        
        const fin = new Date(fechaFin);
        fin.setHours(23, 59, 59, 999);

        // Buscar ventas usando createdAt en lugar de fecha
        const ventas = await Cart.find({
            createdAt: {
                $gte: inicio,
                $lte: fin
            },
            estado: 'completado'
        }).populate('items.producto');

        // Transformar los datos para mantener compatibilidad
        const ventasFormateadas = ventas.map(venta => ({
            ...venta.toJSON(),
            fecha: venta.createdAt // Usar createdAt como fecha
        }));

        res.status(200).json(ventasFormateadas);
    } catch (error) {
        console.error('Error al obtener el reporte de ventas:', error);
        res.status(500).json({
            message: 'Error al obtener el reporte de ventas',
            error: error.message
        });
    }
};

// Modificar el controlador finalizarCompra para incluir más datos
export const finalizarCompra = async (req, res) => {
    try {
        const { items } = req.body;

        // Generar folio único usando timestamp
        const timestamp = new Date().getTime();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const folio = `V${timestamp}${random}`;

        // Crear nuevo carrito con folio y estado
        const cart = new Cart({
            items: items.map(item => ({
                producto: item.id,
                cantidad: item.cantidad,
                precio: item.precio
            })),
            total: items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0),
            folio,
            estado: 'completado'
        });

        await cart.save();

        res.status(200).json({
            message: 'Compra finalizada con éxito',
            cart
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error al finalizar la compra',
            error: error.message 
        });
    }
};

// Función auxiliar para generar folios
const generarFolio = async () => {
    const fecha = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const ultimaVenta = await Cart.findOne({}, {}, { sort: { 'fecha': -1 } });
    const numero = ultimaVenta ? (parseInt(ultimaVenta.folio.slice(-4)) + 1) : 1;
    return `V${fecha}${numero.toString().padStart(4, '0')}`;
};

