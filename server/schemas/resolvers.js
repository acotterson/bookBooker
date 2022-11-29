const { AuthenticationError } = require("apollo-server-express");
const { User, Book } = require("../models");
const { signToken } = require("../utils/auth");

const resolvers = {
  Query: {
    me: async (parent, context) => {
      if (context.user) {
        return User.findOne({ _id: context.user._id }).populate("savedBooks");
      }
      throw new AuthenticationError("Log in first");
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      const token = signToken(user);
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      const user = await User.findOne({ email });

      if (!user) {
        throw new AuthenticationError("No user with that email");
      }

      const correctPw = await user.isCorrectPassword(password);

      if (!correctPw) {
        throw new AuthenticationError("Bad password");
      }
      const token = signToken(user);
      return { token, user };
    },
    saveBook: async (parent, { input }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: _id },
          {
            $addToSet: {
              savedBooks: input,
            },
          },
          { new: true, runValidators: true }
        );
      }
      throw new AuthenticationError("Log in first");
    },
    removeBook: async (parent, { bookId }, context) => {
      if (context.user) {
        return User.findOneAndUpdate(
          { _id: _id },
          {
            $pull: {
              savedBooks: {
                _id: bookId,
              },
            },
          },
          { new: true }
        );
      }
      throw new AuthenticationError("Log in first");
    },
  },
};

module.exports = resolvers;
