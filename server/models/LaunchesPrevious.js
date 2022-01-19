
module.exports = (sequelize, DataTypes) => {
    const LaunchesPrevious = sequelize.define("LaunchesPrevious", {
      launch_id: 
      {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: 
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      description: 
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      imgURL:
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      vidURL:
      {
        type: DataTypes.TEXT,
        allowNull: true
      },
      launchDate:
      {
        type: DataTypes.DATE,
        allowNull: true
      },
      padName:
      {
        type: DataTypes.TEXT,
        allowNull: true
      },
      locationName:
      {
        type: DataTypes.TEXT,
        allowNull: true
      },
      countryCode:
      {
        type: DataTypes.TEXT,
        allowNull: true
      },
      postId:
      {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    });
  
    return LaunchesPrevious;
  };
  
