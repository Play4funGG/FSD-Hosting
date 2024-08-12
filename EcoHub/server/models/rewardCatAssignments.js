module.exports = (sequelize, DataTypes) => {
    const RewardCategoryAssignments = sequelize.define("RewardCategoryAssignments", {
        assign_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rewards_type_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'rewardCategory',
                key: 'rewardCatID'
            }
        },
        reward_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'rewards',
                key: 'reward_id'
            }
        },
    }, {
        tableName: 'rewardCategoryAssignments',
        timestamps: false //ensure disable timestamps  - terrence
    });

    RewardCategoryAssignments.associate = (models) => {
        RewardCategoryAssignments.hasMany(models.Events, {
            foreignKey: "event_cat_id",
            as: 'events'
        });
    };

    return RewardCategoryAssignments;
};
