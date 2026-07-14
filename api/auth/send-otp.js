import twilio from 'twilio';

// Initialize Twilio client
const twilioClient = process.env.TWILIO_SID && process.env.TWILIO_AUTH_TOKEN 
  ? twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

// In-memory OTP store (in production, use Redis or database)
const otpStore = new Map();

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
    const { phone, role, isLogin } = req.body;
    const cleanPhone = String(phone || "").replace(/\D/g, "");
    
    if (!cleanPhone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    // Generate 6-digit OTP
    const code = String(Math.floor(100000 + Math.random() * 900000));
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    // Store OTP
    otpStore.set(cleanPhone, { code, expiresAt });
    console.log(`[OTP] Phone ${cleanPhone} -> ${code}`);

    // Send OTP via Twilio if configured
    if (twilioClient && process.env.TWILIO_SERVICE_ID) {
      try {
        await twilioClient.verify.v2
          .services(process.env.TWILIO_SERVICE_ID)
          .verifications.create({
            to: `+91${cleanPhone}`,
            channel: "sms",
          });
        console.log(`[Twilio] OTP sent successfully to ${cleanPhone}`);
      } catch (twilioError) {
        console.error(`[Twilio] Failed to send OTP: ${twilioError.message}`);
        // Continue with local OTP fallback
      }
    } else {
      console.log(`[OTP] Twilio not configured - using local OTP only`);
    }

    // Return OTP for testing (in production, remove this)
    return res.json({ 
      success: true, 
      isNewUser: !isLogin,
      otp: code, // Include OTP for testing
      message: `OTP is ${code} (testing mode - in production this will be sent via SMS)`
    });
  } catch (error) {
    console.error('[Send OTP Error]', error);
    return res.status(400).json({ message: error.message });
  }
}
