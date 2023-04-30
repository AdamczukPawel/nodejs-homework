const Joi = require("joi");

const schema = Joi.object({
  name: Joi.string(),
  email: Joi.string().email(),
  phone: Joi.string(),
  favorite: Joi.boolean(),
});

const schemaFavorite = Joi.object({
  favorite: Joi.boolean(),
});

const contactValidation = (req, res, next) => {
  const { output } = schema.validate(req.body);
  if (output) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

const contactFavoriteValidation = (req, res, next) => {
  const { favoriteOutput } = schemaFavorite.validate(req.body);
  if (favoriteOutput) {
    return res.status(400).json({ message: error.details[0].message });
  }
  next();
};

module.exports = { contactValidation, contactFavoriteValidation };
