const { RESTDataSource } = require("apollo-datasource-rest");

class datasourceTraffic extends RESTDataSource {
  constructor() {
    super();
    if (process.env.NODE_ENV === 'production')
      this.baseURL = 'https://graphql-123-json.herokuapp.com/';
    else
      this.baseURL = 'http://localhost:3000/';
  }

  async getLiveTraffic(SectionID) {
    const result = await this.get('LiveTraffics', {
      SectionID
    });
    return result[0];
  }

  async getSection(SectionID) {
    const result = await this.get('sections', {
      SectionId: SectionID
    });
    return result;
  }

  async getLink(LinkID) {
    const result = await this.get('Links', {
      LinkId: LinkID
    });
    console.log(result)
    return result[0];
  }


}

module.exports = datasourceTraffic;