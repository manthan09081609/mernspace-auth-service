import { checkSchema } from "express-validator";

export default checkSchema({
  email: {
    isEmail: {
      errorMessage: "enter a valid email",
    },
    notEmpty: {
      errorMessage: "email is required",
    },
  },
});

// export default [body("email").notEmpty().withMessage("email is required")];
