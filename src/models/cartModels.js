import mongoose from 'mongoose';

const cartItemSchema = new mongoose.Schema({
    producto: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Product', 
        required: true 
    },
    cantidad: { 
        type: Number, 
        required: true, 
        min: 1 
    },
    precio: { 
        type: Number, 
        required: true 
    },
});

const cartSchema = new mongoose.Schema({
    items: [cartItemSchema],
    total: { 
        type: Number, 
        default: 0 
    },
    folio: {
        type: String,
        unique: true
    },
    estado: {
        type: String,
        enum: ['pendiente', 'completado', 'cancelado'],
        default: 'completado'
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual para compatibilidad con el código del reporte
cartSchema.virtual('fecha').get(function() {
    return this.createdAt;
});

// Índices para mejorar el rendimiento de las consultas
cartSchema.index({ createdAt: -1 });
cartSchema.index({ estado: 1 });
cartSchema.index({ folio: 1 });

export default mongoose.model('Cart', cartSchema);