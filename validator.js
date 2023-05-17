import Joi from "joi";

const contactSchema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

export const contactValidation = (req, res, next) => {
  const { output } = contactSchema.validate(req.body);
  if (output) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const userSchema = Joi.object({
  password: Joi.string().required(),
  email: Joi.string().email().required(),
});

export const userValidation = (req, res, next) => {
  const { output } = userSchema.validate(req.body);
  if (output) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};