import Contact from "./contactModel.js";

export const listContacts = async () => {
  try {
    const contacts = await Contact.find();
    return contacts;
  } catch (error) {
    console.error(error);
  }
};

export const getContactById = async (contactId) => {
  const contact = await Contact.findOne({ _id: contactId });
  return contact;
};

export const removeContact = async (contactId) => {
  const deletedContact = Contact.findOneAndDelete({ _id: contactId });
  return deletedContact;
};

export const addContact = async (body) => {
  const newContact = Contact.create(body);
  return newContact;
};

export const updateContact = async (contactId, body) => {
  const updatedContact = Contact.findOneAndUpdate({ _id: contactId }, body, {
    new: true,
  });
  return updatedContact;
};

export const updateFavorite = async (contactId, body) => {
  const updatedFavoriteContact = Contact.findOneAndUpdate(
    { _id: contactId },
    body,
    { new: true }
  );
  return updatedFavoriteContact;
};
