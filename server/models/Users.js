
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
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      resetToken: {
        type: DataTypes.STRING,
        allowNull: true
      },
      expireToken: {
        type: DataTypes.DATE,
        allowNull: true
      }
    });

    return Users;
  };
  
