
module.exports = (sequelize, DataTypes) => {
    const Launches = sequelize.define("Launches", {
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
    //   add image path and vidURL later.
    });
  
    return Launches;
  };
  
