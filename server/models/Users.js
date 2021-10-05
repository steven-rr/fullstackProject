
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
      }
    });
    const options = {onDelete: "cascade"}

    // each user has associated posts
    Users.associate = (models)=>{
      Users.hasMany(models.Posts, options)

    }
    
    return Users;
  };
  
