# Twilio Setup Guide for FarmConnect

## Step 1: Create Twilio Account
1. Go to [Twilio Console](https://www.twilio.com/console)
2. Sign up for a free account
3. Verify your email address

## Step 2: Get Account Credentials
1. From the Twilio Console Dashboard, copy:
   - **Account SID** (TWILIO_SID)
   - **Auth Token** (TWILIO_AUTH_TOKEN)

## Step 3: Create Verify Service
1. Go to **Explore Products** → **Verify** → **Services**
2. Click **Create new service**
3. Give it a friendly name (e.g., "FarmConnect OTP")
4. Configure:
   - **Code length**: 6 digits
   - **Code expiry**: 5 minutes
   - **Attempts**: 3
5. Copy the **Service SID** (TWILIO_SERVICE_ID)

## Step 4: Update Environment Variables
Add these to your `.env` file:

```env
# Twilio Configuration
TWILIO_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_SERVICE_ID=your_twilio_verify_service_id
```

## Step 5: Test the Setup
1. Start your server: `npm run dev`
2. Test OTP sending:
   ```bash
   curl -X POST http://localhost:5000/api/auth/send-otp \
     -H "Content-Type: application/json" \
     -d '{"phone": "YOUR_PHONE_NUMBER"}'
   ```
3. Check console logs for OTP code (development mode)
4. Verify OTP:
   ```bash
   curl -X POST http://localhost:5000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"phone": "YOUR_PHONE_NUMBER", "otp": "123456"}'
   ```

## Security Features Implemented
✅ **OTP Expiry**: 5 minutes
✅ **Rate Limiting**: Built-in Twilio protection
✅ **Fallback**: Local OTP if Twilio fails
✅ **Phone Verification**: Tracks verified status in DB
✅ **Secure Token**: JWT for authenticated sessions

## Cost Information
- **Free Trial**: $15.50 credit when you sign up
- **Verify API**: ~$0.05 per verification
- **SMS**: ~$0.0079 per message (varies by country)

## Notes
- In development, OTP codes are logged to console
- Production will send actual SMS messages
- System falls back to local OTP if Twilio is unavailable
- Phone numbers are automatically formatted with +91 prefix for India
