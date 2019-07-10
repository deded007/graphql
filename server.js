const { ApolloServer, gql } = require("apollo-server");
const TestAPI = require("./datasource");

const typeDefs = gql`
"""
經緯度
"""
type StationPosition {
  PositionLat:Float
  PositionLon:Float
}
type AlertStation {
  StationID:String
  StationName:String
  StationPosition:StationPosition
  TimeTables:[TimetableTimetable]
}
  """
  通堵
  """
type Alert {
 Title:String
 Description:String 
 Stations:[AlertStation]
}

  "中英文"
type ZhEn {
  "中文"
  Zh_tw:String
  "英文"
  En:String
}
  """
  站名
  """
type Station {
  "編號"
  StationID:String
  "中文站名"
  StationName:ZhEn
  StationPosition:StationPosition
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
 "通堵"
  alerts: [Alert]
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
    alerts: (root, args, { dataSources }) => dataSources.testAPI.getAlerts(),
    station: (root, { StationID }, { dataSources }) => dataSources.testAPI.getStation(StationID),
    stations: (root, args, { dataSources }) => dataSources.testAPI.getAllStations(),
    timetable: (root, { StationID }, { dataSources }) => dataSources.testAPI.getTimetable(StationID),
    timetables: (root, args, { dataSources }) => dataSources.testAPI.getTimetables(),
  },
  Alert: {
    Stations: (parent) => {
      const { Stations } = parent.Scope;
      return Stations;
    }
  },
  AlertStation: {
    StationPosition: (parent, args, context) => {
      var { StationID } = parent;

      var a = context.dataSources.testAPI.getStation(StationID);
      return Promise.all([a]).then(function (values) {
        return values[0].StationPosition; 
      });
    },
    TimeTables: (parent, args, context) => {
      var { StationID } = parent;

      var a = context.dataSources.testAPI.getTimetable(StationID);
      return Promise.all([a]).then(function (values) {
        console.log(values[0])
        return values[0].TimeTables; 
      });
    },
  }
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

server.listen({ port: process.env.PORT || 4100 }).then(({ url }) => {
    console.log(`🚀 Server ready at ${url}`);
});