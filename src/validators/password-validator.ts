import { checkSchema } from "express-validator";
export default checkSchema({
  password: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "password is required",
    },
    isLength: {
      errorMessage: "password must be 8 characters long",
      options: {
        min: 8,
        max: 20,
      },
    },
  },
  oldPassword: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "password is required",
    },
    isLength: {
      errorMessage: "password must be 8 characters long",
      options: {
        min: 8,
        max: 20,
      },
    },
  },
  newPassword: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "password is required",
    },
    isLength: {
      errorMessage: "password must be 8 characters long",
      options: {
        min: 8,
        max: 20,
      },
    },
  },
});

// export default [body("email").notEmpty().withMessage("email is required")];
