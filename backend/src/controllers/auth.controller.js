const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body, req);
    res.status(201).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    res.status(200).json(result);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

const googleLogin = async (req, res, next) => {
  try {
    const { tokenId } = req.body;
    const result = await authService.googleLogin(tokenId);
    res.status(200).json(result);
  } catch (error) {
    res.status(401);
    next(error);
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.params;
    const result = await authService.verifyEmail(token);
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};



const getProfile = async (req, res, next) => {
  try {
    const result = await authService.getProfile(req.user._id);
    res.status(200).json(result);
  } catch (error) {
    res.status(404);
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const result = await authService.updateProfile(req.user._id, req.body);
    res.status(200).json(result);
  } catch (error) {
    res.status(400);
    next(error);
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  verifyEmail,
  getProfile,
  updateProfile,
};
