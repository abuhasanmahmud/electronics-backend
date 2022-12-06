const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  getUserProfile,
  updatePassword,
  updateProfile,
  logout,
  allUsers,
  getUserDetails,
  updateUser,
  deleteUser,
} = require("../controllers/authController");

const { isAuthenticatedUser, authorizeRoles } = require("../middlewares/auth");

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/password/forget", forgotPassword);

router.route("/password/reset/:token").post(resetPassword);

router.route("/logout").get(logout);

router.route("/me").get(isAuthenticatedUser, getUserProfile);
router.route("/password/update").put(isAuthenticatedUser, updatePassword);
router.route("/me/update/:id").put(isAuthenticatedUser, updateProfile);

router.route("/admin/users").post(isAuthenticatedUser, authorizeRoles("admin"), allUsers);
router
  .route("/admin/user/:id")
  .get(isAuthenticatedUser, authorizeRoles("admin"), getUserDetails)
  .put(isAuthenticatedUser, authorizeRoles("admin"), updateUser)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), deleteUser);

module.exports = router;
