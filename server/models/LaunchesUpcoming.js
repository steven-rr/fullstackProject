
module.exports = (sequelize, DataTypes) => {
    const LaunchesUpcoming = sequelize.define("LaunchesUpcoming", {
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
  
    return LaunchesUpcoming;
  };
  
