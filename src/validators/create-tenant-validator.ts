import { checkSchema } from "express-validator";

export default checkSchema({
  name: {
    trim: true,
    notEmpty: {
      errorMessage: "tenant name is required",
    },
    isLength: {
      errorMessage: "tenant name must be 4-100 character long",
      options: {
        min: 4,
        max: 100,
      },
    },
  },
  address: {
    trim: true,
    notEmpty: {
      errorMessage: "address is required",
    },
    isLength: {
      errorMessage: "address must be 10-255 characters long",
      options: {
        min: 10,
        max: 255,
      },
    },
  },
});
