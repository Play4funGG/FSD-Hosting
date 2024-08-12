const rewardsType = require("./rewardsType");

module.exports = (sequelize, DataTypes) => {
    const Rewards = sequelize.define("Rewards", {
        reward_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        reward_name: {
            type: DataTypes.STRING(45),
            allowNull: false
        },
        rewards_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'rewardType',
                key: 'rewards_type_id'
            }
        },
        reward_quantity: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reward_duration: {
            type: DataTypes.DECIMAL,
            allowNull: false
        },
        reward_description: {
            type: DataTypes.STRING(1000),
            allowNull: false
        }
        
    },
     {
        tableName: 'rewards',
        timestamps: false //ensure disable timestamps  - terrence
    });

    Rewards.associate = (models) => {
        Rewards.hasMany(models.RewardClaims, {
            foreignKey: "reward_id",
            as: 'rewards'
        });
        Rewards.belongsTo(models.RewardsType, {
            foreignKey: "rewards_type_id",
            as: 'rewardsType'
        });
    };

    return Rewards;
};
