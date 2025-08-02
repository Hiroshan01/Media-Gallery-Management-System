import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config()


const createTransporter = () => {
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: parseInt(process.env.EMAIL_PORT),
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });
};

// Send OTP email for registration
export async function sendRegistrationOTP(email, name, otp) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Media Gallery" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Email Verification - Media Gallery',
            html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Media Gallery</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              Welcome to Media Gallery! To complete your registration, please verify your email address using the OTP code below:
            </p>
            
            <div style="background: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; border: 2px dashed #667eea;">
              <h1 style="color: #667eea; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              <strong>Important:</strong> This OTP will expire in 10 minutes. If you didn't request this verification, please ignore this email.
            </p>
            
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This is an automated message from Media Gallery. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Registration OTP sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending registration OTP:', error);
        throw new Error('Failed to send verification email');
    }
};

// Send OTP email for password reset
export async function sendPasswordResetOTP(email, name, otp) {
    try {
        const transporter = createTransporter();

        const mailOptions = {
            from: `"Media Gallery" <${process.env.EMAIL_USER}>`,
            to: email,
            subject: 'Password Reset - Media Gallery',
            html: `
          <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">Media Gallery</h1>
          </div>
          
          <div style="background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e9ecef;">
            <h2 style="color: #333; margin-bottom: 20px;">Hello ${name}!</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6;">
              We received a request to reset your password. Use the OTP code below to reset your password:
            </p>
            
            <div style="background: white; padding: 20px; margin: 20px 0; text-align: center; border-radius: 8px; border: 2px dashed #f5576c;">
              <h1 style="color: #f5576c; font-size: 32px; margin: 0; letter-spacing: 8px;">${otp}</h1>
            </div>
            
            <p style="color: #666; font-size: 14px; margin-bottom: 20px;">
              <strong>Important:</strong> This OTP will expire in 10 minutes. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
            </p>
            
            <div style="border-top: 1px solid #e9ecef; padding-top: 20px; margin-top: 30px;">
              <p style="color: #999; font-size: 12px; text-align: center;">
                This is an automated message from Media Gallery. Please do not reply to this email.
              </p>
            </div>
          </div>
        </div>
      `,
        };

        const result = await transporter.sendMail(mailOptions);
        console.log('Password reset OTP sent successfully:', result.messageId);
        return { success: true, messageId: result.messageId };
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        throw new Error('Failed to send password reset email');
    }
};


export function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
};


export function isValidOTP(otp) {
    return /^\d{6}$/.test(otp);
};
