
module.exports = (sequelize, DataTypes) => {
    const APICounters = sequelize.define("APICounters", {
       counter: {
            type: DataTypes.INTEGER,
            defaultValue: '0'
       }
    });
  
    return APICounters;
  };
  
