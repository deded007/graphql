const { ApolloServer, gql } = require("apollo-server-express");
const TestAPI = require("./datasource");
const datasourceTraffic = require("./datasourceTraffic");
var express = require('express');
var app = express();

//https://matheusr42.github.io/json-to-graphql-schema-online/
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


# ##################################################################################################


"""
取得[高速公路局]路段即時資料
  """
type LiveTraffic {
  "機關發布路段代碼 "
  SectionID: String
  "路段平均旅行時間, 單位:秒"
  TravelTime: Int
  "路段平均旅行速度, 單位:KM/Hr "
  TravelSpeed: Int
  "壅塞水準組別代碼"
  CongestionLevelID: String
  "壅塞級別, -99=資料異常"
  CongestionLevel: String
  "資料蒐集時間"
  DataCollectTime: String
  "即時路況資訊來源種類"
  DataSources: LiveTrafficDataSources
}

"""
  livetraffic.DataSources
  """
type LiveTrafficDataSources {
  "是否包含歷史資料"
  HasHistorical: Int
  HasVD: Int
  HasAVI: Int
  HasETAG: Int
  "是否包含GVP資料(GPS Vehicle Probe) = ['0: 不包含', '1: 包含'] ,"
  HasGVP: Int
  "是否包含CVP資料(Cellular Vehicle Probe) = ['0: 不包含', '1: 包含'] ,"
  HasCVP: Int
  "是否包含其他多元路況資料 = ['0: 不包含', '1: 包含']"
  HasOthers: Int
}



# ##################################################################################################



type WeatherForecastsValues {
  Temperature: String
  DewPointTemperature: String
  ComfortIndex: String
  WindDirectionDescription: String
  WeatherDescription: String
  ProbabilityOfPrecipitation12Hourly: String
  WindSpeed: String
  WindScale: String
  ComfortIndexDescription: String
  Weather: String
  RelativeHumidity: String
  ApparentTemperature: String
  ProbabilityOfPrecipitation6Hourly: String
}

type WeatherForecasts {
  DateTime: String
  Values: WeatherForecastsValues
}

type StarEndLink {
  LinkID: String
  Latitude: Float
  Longitude: Float
  TownCode: String
  CountyName: String
  TownName: String
  WeatherForecasts: [WeatherForecasts]
}

type Link {
  LinkId: String
  Latitude: Float
  Longitude: Float
  TownCode: String
  CountyName: String
  TownName: String
  WeatherForecasts: [WeatherForecasts]
}
type Section {
  "取得[高速公路局]路段即時資料"
  LiveTraffic: LiveTraffic
  StartLink: StarEndLink
  EndLink: StarEndLink
}


# ##################################################################################################




  type Query {
#  "通堵"
#   alerts: [Alert]
#  "單一車站"
#     station(StationID: String!): Station
#  "所有車站"
#     stations: [Station]
#  "單一車站時刻表"
#     timetable(StationID: String!): Timetable
#  "所有車站時刻表"
#     timetables: [Timetable]
#     people: [People]
    
    section(SectionID: String!): Section
    link(LinkID: String!): Link
  }
`;

const resolvers = {
  Query: {
    // alerts: (root, args, { dataSources }) => dataSources.testAPI.getAlerts(),
    // station: (root, { StationID }, { dataSources }) => dataSources.testAPI.getStation(StationID),
    // stations: (root, args, { dataSources }) => dataSources.testAPI.getAllStations(),
    // timetable: (root, { StationID }, { dataSources }) => dataSources.testAPI.getTimetable(StationID),
    // timetables: (root, args, { dataSources }) => dataSources.testAPI.getTimetables(),
    // people: (root, args, { dataSources }) => dataSources.testAPI.getPeoples(),


    section: (root, args, { dataSources }) => args.SectionID,
    link: (root, args, { dataSources }) => dataSources.datasourceTraffic.getLink(args.LinkID),
    //dataSources.datasourceTraffic.getLiveTraffic(SectionID),
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
  Section: {
    LiveTraffic: (para, args, context) => {
      var a = context.dataSources.datasourceTraffic.getLiveTraffic(para);
      return Promise.all([a]).then(function (values) {
        //console.log("LiveTraffic" + values[0])
        return values[0];
      });
    },
    StartLink: (para, args, context) => {
      var a = context.dataSources.datasourceTraffic.getSection(para);
      return Promise.all([a]).then(function (values) {
        var ans = values[0][0].StartLink;
        ans.LinkID = ans.LinkId;
        return ans;
      });
    },
    EndLink: (para, args, context) => {
      var a = context.dataSources.datasourceTraffic.getSection(para);
      return Promise.all([a]).then(function (values) {
        var ans = values[0][0].EndLink;
        ans.LinkID = ans.LinkId;
        return ans;
      });
    },
  }
}

const server = new ApolloServer({
  typeDefs,
  resolvers,
  dataSources: () => ({
    testAPI: new TestAPI(),
    datasourceTraffic: new datasourceTraffic(),
  }),
  introspection: true, // enables introspection of the schema
  playground: true, // enables the actual playground
});

//process.env.NODE_ENV = 'production'
server.applyMiddleware({ app }); // app is from an existing express app
app.use(express.static('public'));

app.get('/', function (req, res) {
  res.redirect('/traffic.html')
});
app.listen({ port: process.env.PORT || 4100 }, function () {
  console.log('http://localhost:4100');
});