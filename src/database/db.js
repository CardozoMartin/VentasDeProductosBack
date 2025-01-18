import mongoose from 'mongoose';

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://martincardozo1993xp:wCqSETzkYhwSSpk3@cluster-63i.bkvhzgl.mongodb.net/test?retryWrites=true&w=majority&appName=Cluster-63i', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Conectado a MongoDB');
  } catch (error) {
    console.error('Error conectando a MongoDB:', error);
    process.exit(1); // Detener la aplicación si hay error
  }
};

export default connectDB;
