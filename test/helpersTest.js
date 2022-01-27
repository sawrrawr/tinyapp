const chai = require('chai');
const assert = chai.assert;
const getUserByEmail = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedUser = testUsers["userRandomID"];
    assert.deepEqual(expectedUser, user);
  });
  it('should return undefined if the email is not in the database', () => {
    const user = getUserByEmail("noexistance@example.com", testUsers);
    assert.equal(user, undefined);
  });
});