import mongoose from 'mongoose';

export async function handler(req, res) {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    res.status(200).json({ message: 'Connected to DB successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Error connecting to DB', error });
  }
}
