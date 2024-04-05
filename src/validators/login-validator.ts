import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    trim: true,
    notEmpty: {
      errorMessage: "email is required",
    },
    isEmail: {
      errorMessage: "email is not valid",
    },
  },
  password: {
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
