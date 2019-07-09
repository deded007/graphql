const { RESTDataSource } = require("apollo-datasource-rest");

 class TestAPI extends RESTDataSource {
  constructor() {
    super();
    //this.baseURL = 'http://localhost:3000';
    this.baseURL = 'https://graphql-123-json.herokuapp.com/';
  }

  async getAlerts() {
    const result = await this.get('alerts');
    return result;
  }

  async getAllStations() {
    const result = await this.get('stations');
    return result;
  }

  async getStation(StationID) {
    const result = await this.get('stations', {
      StationID
    });
console.log(result[0])
return result[0];
  }


  async getTimetables() {
    var result = await this.get('timetables');
    console.log(result[0]);
    return result;
  }

  async getTimetable(StationID) {
    const result = await this.get('timetables', {
      StationID
    });

    return result[0];
  }
};


module.exports = TestAPI;