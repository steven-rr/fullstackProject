
module.exports = (sequelize, DataTypes) => {
    const Users = sequelize.define("Users", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    });
  
    return Users;
  };
  
 // firstname: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // lastname: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // email: {
      //   type: DataTypes.STRING,
      //   allowNull: false,
      // },
      // register_date: {
        
      // }