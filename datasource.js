import { RESTDataSource } from 'apollo-datasource-rest';

export class TestAPI extends RESTDataSource {
  constructor() {
    super();
    this.baseURL = 'http://localhost:3000/';
  }

  async getAllStations() {
    return this.get('stations');
  }

  async getStation(StationID) {
    const result = await this.get('stations', {
      StationID
    });
    return result[0];
  }


  async getTimetables() {
    var result = await this.get('timetables');
    return result;
  }

  async getTimetable(StationID) {
    const result = await this.get('timetables', {
      StationID
    });
    console.log(result);

    return result[0];
  }
};