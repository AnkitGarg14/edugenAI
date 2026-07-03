const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { OAuth2Client } = require('google-auth-library');
const sendEmail = require('../utils/sendEmail');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID || 'dummy_client_id');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', {
    expiresIn: '30d',
  });
};

const registerUser = async (userData, req) => {
  const { name, email, password } = userData;

  const userExists = await User.findOne({ email });
  if (userExists) {
    throw new Error('User already exists');
  }

  const user = await User.create({
    name,
    email,
    password,
  });

  const verificationToken = user.getVerificationToken();
  await user.save({ validateBeforeSave: false });

  // Create verification URL
  const protocol = req.protocol || 'http';
  const host = req.get('host') || 'localhost:5000';
  // In production, point to frontend URL
  const verifyUrl = `${protocol}://${host}/api/auth/verify-email/${verificationToken}`;

  const message = `You are receiving this email because you (or someone else) have registered an account. Please make a GET request to: \n\n ${verifyUrl}`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'Email Verification',
      message,
    });
  } catch (err) {
    user.verificationToken = undefined;
    await user.save({ validateBeforeSave: false });
    console.error('Email could not be sent', err);
  }

  return { message: 'User registered. Please check email to verify account.' };
};

const verifyEmail = async (token) => {
  const verificationToken = crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');

  const user = await User.findOne({ verificationToken });

  if (!user) {
    throw new Error('Invalid or expired token');
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return { message: 'Email successfully verified' };
};

const loginUser = async (email, password) => {
  const user = await User.findOne({ email });

  if (!user || !(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  if (!user.isVerified) {
    throw new Error('Please verify your email before logging in');
  }

  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    avatar: user.avatar,
    token: generateToken(user._id),
  };
};

const googleLogin = async (tokenId) => {
  try {
    console.log('[Google Auth] Credential received, verifying idToken...');
    
    // Decode token to see what audience it actually has
    const decoded = jwt.decode(tokenId);
    console.log('[Google Auth] Decoded token audience:', decoded?.aud);
    console.log('[Google Auth] Expected audience:', process.env.GOOGLE_CLIENT_ID);
    
    const clientId = process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.trim() : 'dummy_client_id';
    
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: clientId,
    });
    
    const payload = ticket.getPayload();
    console.log('[Google Auth] verifyIdToken result successful. Extracted email:', payload.email);
    const { email, name, picture, sub } = payload;

    let user = await User.findOne({ email });

    if (!user) {
      console.log('[Google Auth] No existing user found. Creating new user.');
      // Create user if doesn't exist
      user = await User.create({
        name,
        email,
        googleId: sub,
        avatar: picture,
        isVerified: true,
        // Since password is required in schema, generate a random one for google auth users
        password: crypto.randomBytes(16).toString('hex') 
      });
      console.log('[Google Auth] User created successfully:', user._id);
    } else {
      console.log('[Google Auth] Existing user found. Checking if linking is needed.');
      let isModified = false;
      if (!user.googleId) {
        user.googleId = sub;
        isModified = true;
        console.log('[Google Auth] Linking googleId to existing user.');
      }
      if (!user.isVerified) {
        user.isVerified = true;
        isModified = true;
        console.log('[Google Auth] Verifying existing user email.');
      }
      if (!user.avatar && picture) {
        user.avatar = picture;
        isModified = true;
      }
      if (isModified) {
        await user.save();
      }
    }

    const token = generateToken(user._id);
    console.log('[Google Auth] JWT generated successfully.');

    return {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      token,
    };
  } catch (error) {
    console.error('[Google Auth] Error during login:', error);
    throw new Error(`Google Login Failed: ${error.message}`);
  }
};



const getProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) throw new Error('User not found');
  return user;
};

const updateProfile = async (userId, data) => {
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  user.name = data.name || user.name;
  if (data.email) user.email = data.email;
  if (data.password) user.password = data.password;

  const updatedUser = await user.save();

  return {
    _id: updatedUser._id,
    name: updatedUser.name,
    email: updatedUser.email,
    role: updatedUser.role,
    avatar: updatedUser.avatar,
    token: generateToken(updatedUser._id),
  };
};

module.exports = {
  registerUser,
  loginUser,
  googleLogin,
  verifyEmail,
  getProfile,
  updateProfile,
};
