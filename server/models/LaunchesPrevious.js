
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
      vehicle_description: 
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      mission_description:
      {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status:
      {
        type: DataTypes.STRING,
        allowNull: false
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
      launchSeconds:
      {
        type: DataTypes.INTEGER,
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
      },
      likeCounter:
      {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      futureFlag:
      {
        type: DataTypes.STRING,
        allownull: true
      }
    });
  
    return LaunchesPrevious;
  };
  
