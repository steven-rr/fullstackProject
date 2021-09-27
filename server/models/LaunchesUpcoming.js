
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
      }
    //   add image path and vidURL later.
    });
  
    return LaunchesUpcoming;
  };
  
