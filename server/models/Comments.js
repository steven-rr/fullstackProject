
module.exports = (sequelize, DataTypes) => {
    const Comments = sequelize.define("Comments", {
       contentText: {
            type: DataTypes.STRING,
            allowNull: false,
       },
       username: {
         type: DataTypes.STRING,
         allowNull: true,
       },
       parentId: {
         type: DataTypes.INTEGER,
         allowNull: true
       },
       level: {
          type: DataTypes.INTEGER,
          allowNull: true,
          defaultValue: 0
       },
       likeCounter:
       {
         type: DataTypes.INTEGER,
         allowNull: true,
         defaultValue: 0
       },
       hasBeenDeleted:
       {
         type: DataTypes.BOOLEAN,
         allowNull: true,
         defaultValue: false
       }
    });
  
    return Comments;
  };
  
