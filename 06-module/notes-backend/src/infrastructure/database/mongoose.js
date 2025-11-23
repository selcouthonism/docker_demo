import mongoose from 'mongoose';

export const connectDB = async (uri) => {
  
    await mongoose.connect(uri, {
  
    }).catch(err => {
        console.error('Something went wrong!');
        console.error(err);
    });
  
  console.log("Connected to MongoDB");
}