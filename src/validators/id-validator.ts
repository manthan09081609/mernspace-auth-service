import { checkSchema } from "express-validator";

export default checkSchema({
  id: {
    isInt: true,
    errorMessage: "Id is not valid",
  },
});
