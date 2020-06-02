const campErrors = (camp) => {
  // TODO check if it's even a plain string. (for the api)

  if (camp.name.length === 0)
    return {
      field: "name",
      err: "Camp name is required",
    };

  if (camp.name.length > 48)
    return {
      field: "name",
      err: "Camp name must be 48 characters or less",
    };

  return null;
};

module.exports.campErrors = campErrors;
