import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const URI = "mongodb://localhost:27017/invoice-ocr";

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'personal' }
});

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const User = mongoose.model('UserTest', UserSchema);

async function run() {
  try {
    await mongoose.connect(URI);
    console.log("Connected");
    
    await User.deleteMany({ email: "test-direct@test.com" });
    
    const u = await User.create({ email: "test-direct@test.com", password: "password", role: "personal" });
    console.log("Created User:", u._id);
    await mongoose.disconnect();
  } catch (e) {
    console.error("Error direct:", e);
    process.exit(1);
  }
}
run();
