const { ApolloServer, gql } = require('apollo-server');
const DataLoader = require('dataloader');
//https://ithelp.ithome.com.tw/articles/10207606
const userModel = (() => {
  const users = [
    { id: 1, name: 'A', bestFriendId: 2, followingUserIds: [2, 3, 4] },
    { id: 2, name: 'B', bestFriendId: 1, followingUserIds: [1, 3, 4, 5] },
    { id: 3, name: 'C', bestFriendId: 4, followingUserIds: [1, 2, 5] },
    { id: 4, name: 'D', bestFriendId: 5, followingUserIds: [1, 2, 5] },
    { id: 5, name: 'E', bestFriendId: 4, followingUserIds: [2, 3, 4] }
  ];

  const genPromise = (value, text) =>
    new Promise(resolve => {
      setTimeout(() => {
        console.log(text);
        return resolve(value);
      }, 100);
    });

  return {
    getUserById: id =>
      genPromise(users.find(user => user.id === id), `getUserById: ${id}`),
    getUserByName: name =>
      genPromise(
        users.find(user => user.name === name),
        `getUserByName: ${name}`
      ),
    getUsersByIds: ids =>
      genPromise(
        users.filter(user => ids.includes(user.id)),
        `getUsersByIds: ${ids}`
      ),
    getAllUsers: () => genPromise(users, 'getAllUsers')
  };
})();

const typeDefs = gql `
  type Query {
    user(name: String!): User
    allUsers: [User]
  }

  type User {
    id: Int
    name: String
    bestFriend: User
    followingUsers: [User]
  }
`;

const resolvers = {
  Query: {
    user(root, { name }, { userModel }) {
      return userModel.getUserByName(name);
    },
    allUsers(root, args, { userModel }) {
      return userModel.getAllUsers();
    }
  },
  User: {
    async followingUsers(user, args, { dataloaders }) {
      return dataloaders.users.loadMany(user.followingUserIds)
        // return userModel.getUsersByIds(user.followingUserIds)
    },
    async bestFriend(user, args, { dataloaders }) {
      return dataloaders.users.load(user.bestFriendId)
        // return userModel.getUserById(user.bestFriendId)
    }
  }
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  tracing: true,
  context: async({ req }) => {
    return {
      userModel,
      dataloaders: {
        users: new DataLoader(async userIds => {
          const users = await userModel.getUsersByIds(userIds)
          var ans = users.sort(
            (a, b) => userIds.indexOf(a.id) - userIds.indexOf(b.id)
          )
          return ans;
        })
      }
    }
  }
})

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});