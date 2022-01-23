
module.exports = (sequelize, DataTypes) => {
    const Posts = sequelize.define("Posts", {
      title: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      contentText: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      launchId: {
        type: DataTypes.STRING,
        allowNull: true
      },
      priority: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      inflatedPriority: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
      },
      UserId: {
         type: DataTypes.INTEGER,
         allowNull: true
       },
       likeCounter:
       {
         type: DataTypes.INTEGER,
         allowNull: true,
         defaultValue: 0
       },
       commentCounter:
       {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
       }
       
    });
    
    return Posts;
  };
  
