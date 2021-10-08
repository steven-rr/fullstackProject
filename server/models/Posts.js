
module.exports = (sequelize, DataTypes) => {
    const Posts = sequelize.define("Posts", {
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      contentText: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      launchId: {
        type: DataTypes.INTEGER,
        allowNull: true
      }
    });
    
    const options = {onDelete: "cascade"}
    Posts.associate = (models)=>{
      Posts.hasMany(models.Comments, options)

    }
    return Posts;
  };
  
