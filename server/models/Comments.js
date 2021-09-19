
module.exports = (sequelize, DataTypes) => {
    const Comments = sequelize.define("Comments", {
       contentText: {
            type: DataTypes.STRING,
            allowNull: false,
       }
    });
  
    return Comments;
  };
  
