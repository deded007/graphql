const { RESTDataSource } = require("apollo-datasource-rest");

class TestAPI extends RESTDataSource {
  constructor() {
    super();
    if (process.env.NODE_ENV === 'production')
      this.baseURL = 'https://graphql-123-json.herokuapp.com/';
    else
      this.baseURL = 'http://localhost:3000/';
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

  async getPeoples() {
    var result = await this.get('peoples');
    return result;
  };

  async getPeople(id) {
    const result = await this.get('peoples/' + id);
    return result;
  };
}

module.exports = TestAPI;