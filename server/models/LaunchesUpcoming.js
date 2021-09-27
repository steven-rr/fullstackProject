
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
      }
    });
  
    return LaunchesUpcoming;
  };
  
