const { ApolloServer, gql } = require("apollo-server-express");
const TestAPI = require("./datasource");
var express = require('express');
var app = express();


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

type People {
  id:Int
  friends:[People]
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
    people: [People]
  }
`;

const resolvers = {
  Query: {
    alerts: (root, args, { dataSources }) => dataSources.testAPI.getAlerts(),
    station: (root, { StationID }, { dataSources }) => dataSources.testAPI.getStation(StationID),
    stations: (root, args, { dataSources }) => dataSources.testAPI.getAllStations(),
    timetable: (root, { StationID }, { dataSources }) => dataSources.testAPI.getTimetable(StationID),
    timetables: (root, args, { dataSources }) => dataSources.testAPI.getTimetables(),
    people: (root, args, { dataSources }) => dataSources.testAPI.getPeoples(),
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
      //return Promise.resolve(context.dataSources.testAPI.getStation(StationID))

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
  },
  People: {
    friends: (parent, args, context) => {
      var { id } = parent;
      var a = context.dataSources.testAPI.getPeople(id);
      return Promise.all([a]).then(function (values) {
        if (values[0].friends.length) {
          var promises = []
          values[0].friends.forEach(id => {
            promises.push(context.dataSources.testAPI.getPeople(id))
          });

          return Promise.all(promises).then(function (values) {
            return values
          });
        } else
          return null;
      });
    },

  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    testAPI: new TestAPI(),
  }),
  introspection: true, // enables introspection of the schema
  playground: true, // enables the actual playground
});


app.get('/', function (req, res) {
  res.send('Hello World!');
});
server.applyMiddleware({ app }); // app is from an existing express app
app.use(express.static('public'));

app.listen({ port: process.env.PORT || 4100 }, function () {
  console.log('http://localhost:4100');
});