module.exports = (sequelize, Sequelize) => {
    
    const user = sequelize.define("user", {
      username: {
        type: Sequelize.STRING
      },
      grade: {
        type: Sequelize.INTEGER,
        defaultValue: 0
      }
      
    });
    return user;
  
};
