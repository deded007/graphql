import { ApolloServer, gql } from 'apollo-server';
import { TestAPI } from './datasource';

const typeDefs = gql`
  type AlertStation {
  StationID:String
  StationName:String
  temp:Station
}
type AlertScope {
 Stations:[AlertStation]
}
type Alert {
 Title:String
 Description:String 
 Scope:AlertScope
}

type ZhEn {
  Zhtw:String
  En:String
}
type Station {
  StationID:String
  StationName:ZhEn
  StationAddress:String
}

type TimetableTimetable {
  TrainNo:String
  DepartureTime:String
}
type Timetable {
 StationID:String
 StationName:ZhEn
 TimeTables:[TimetableTimetable]
}
  type Query {
    station(StationID: String!): Station
    stations: [Station]
    timetable(StationID: String!): Timetable
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

server.listen({ process.env.PORT || 4000 }).then(({ url }) => {
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