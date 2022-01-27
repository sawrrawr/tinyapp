//email address lookup
const getUserByEmail = (emailAddress, database) => {
  const listOfUsers = Object.values(database);
  for (const user of listOfUsers) {
    if (user['email'] === emailAddress) {
      const answer = user['id'];
      return database[answer];
    } else {
      return undefined;
    }
  }
};

module.exports = getUserByEmail;