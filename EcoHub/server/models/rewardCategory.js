module.exports = (sequelize, DataTypes) => {
    const RewardCategory = sequelize.define("RewardCategory", {
        rewardCatID: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        eventCatDescription: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        tableName: 'rewardCategory',
        timestamps: false //ensure disable timestamps  - terrence
    });

    RewardCategory.associate = (models) => {
        RewardCategory.hasMany(models.RewardCategoryAssignments, {
            foreignKey: "rewardCatID",
            as: 'rewardCategory'
        });
    };

    return RewardCategory;
};
