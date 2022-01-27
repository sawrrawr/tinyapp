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

// const testUsers = {
//   "userRandomID": {
//     id: "userRandomID", 
//     email: "user@example.com", 
//     password: "purple-monkey-dinosaur"
//   },
//   "user2RandomID": {
//     id: "user2RandomID", 
//     email: "user2@example.com", 
//     password: "dishwasher-funk"
//   }
// };

// console.log(getUserByEmail("user@example.com", testUsers));

module.exports = getUserByEmail