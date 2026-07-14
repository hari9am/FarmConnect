import jwt from 'jsonwebtoken';

// In-memory OTP store (should match send-otp store)
const otpStore = new Map();

// Mock user storage (in production, connect to your database)
const users = new Map();

const JWT_SECRET = process.env.SESSION_SECRET || "your-secret-key";

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { phone, otp, userData } = req.body;
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    const cleanOtp = String(otp || "").replace(/\D/g, "").trim();
    
    if (!cleanPhone || !cleanOtp) {
      return res.status(400).json({ message: "Phone and OTP are required" });
    }

    console.log(`[Auth] OTP verification attempt - phone: ${cleanPhone}, otp: ${cleanOtp}`);
    
    if (cleanOtp.length !== 6) {
      return res.status(400).json({ message: "OTP must be 6 digits" });
    }

    // For testing: accept any 6-digit OTP
    console.log(`[Auth] OTP accepted (testing mode)`);

    let user = users.get(cleanPhone);
    
    // If user doesn't exist and userData is provided, create new user
    if (!user && userData) {
      user = {
        id: `user_${Date.now()}`,
        username: userData.username,
        phone: userData.phone,
        role: userData.role,
        language: userData.language || 'en',
        phoneVerified: true,
      };
      users.set(cleanPhone, user);
    } else if (!user) {
      return res.status(400).json({ message: "User not found. Please register first." });
    }

    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '24h' });

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        phone: user.phone,
        role: user.role,
        language: user.language,
        phoneVerified: true,
      },
    });
  } catch (error) {
    console.error('[Verify OTP Error]', error);
    return res.status(400).json({ message: error.message });
  }
}
