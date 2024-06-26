import { checkSchema } from "express-validator";
export default checkSchema({
  email: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "email is required",
    },
    isEmail: {
      errorMessage: "email is not valid",
    },
  },
  firstName: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "firstname is required",
    },
  },
  lastName: {
    optional: true,
    trim: true,
    notEmpty: {
      errorMessage: "lastname is required",
    },
  },
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
  role: {
    optional: true,
    trim: true,
    notEmpty: true,
    errorMessage: "role is required",
  },
  tenantId: {
    optional: true,
    isInt: true,
    errorMessage: "tenant Id should be a integer",
  },
});

// export default [body("email").notEmpty().withMessage("email is required")];
