
module.exports = (sequelize, DataTypes) => {
    const UniqueCountries = sequelize.define("UniqueCountries", {
      countryCode: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      countryName: {
          type: DataTypes.STRING,
          allowNull: true,
      },
      index: {
          type: DataTypes.TEXT,
          allowNull: true
      }
    });
    
    return UniqueCountries;
  };
  
