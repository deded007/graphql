const { ApolloServer, gql } = require("apollo-server");
const TestAPI = require("./datasource");

const typeDefs = gql`
type ZhEn {
  "中文"
  Zhtw:String
  "英文"
  En:String
}
type Station {
  "編號"
  StationID:String
  "中文站名"
  StationName:ZhEn
}

type TimetableTimetable {
  "車次"
  TrainNo:String
  "到達時間"
  DepartureTime:String
}
  """
  時刻表
  """
type Timetable {
  "編號"
 StationID:String
  "中文站名"
 StationName:ZhEn
 "時刻表"
 TimeTables:[TimetableTimetable]
}
  type Query {
 "單一車站"
    station(StationID: String!): Station
 "所有車站"
    stations: [Station]
 "單一車站時刻表"
    timetable(StationID: String!): Timetable
 "所有車站時刻表"
    timetables: [Timetable]
  }
`;

const resolvers = {
  Query: {
    station: (root, { StationID }, { dataSources }) => dataSources.testAPI.getStation(StationID),
    stations: (root, args, { dataSources }) => dataSources.testAPI.getAllStations(),
    timetable: (root, { StationID }, { dataSources }) => dataSources.testAPI.getTimetable(StationID),
    timetables: (root, args, { dataSources }) => dataSources.testAPI.getTimetables(),
  },
  // Timetable: {
  //   Timetables: ({ z }) => z,
  // },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    testAPI: new TestAPI(),
  }),
});

server.listen({ port: process.env.PORT || 4000 }).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
// https://blog.apollographql.com/layering-graphql-on-top-of-rest-569c915083ad
//https://github.com/apollographql/mvrp


// query{
//   stations{
//     StationID
//   }
// }

// query{
//   station(StationID:"3180"){
//     StationID
//     StationName{
//       Zhtw
//     }
//   }
// }

// query{
//   timetables{
//     StationID
//     StationName{
//       Zhtw
//       En
//     }
//     TimeTables{
//       TrainNo
//       DepartureTime
//     }
//   }
// }

// query($StationID:String!){
//   timetable(StationID:$StationID){
//     StationID
//     StationName{
//       Zhtw
//       En
//     }
//     TimeTables{
//       TrainNo
//       DepartureTime
//     }
//   }
//   station(StationID:$StationID){
//     StationID
//     StationName{
//       Zhtw
//       En
//     }
//   }
// }