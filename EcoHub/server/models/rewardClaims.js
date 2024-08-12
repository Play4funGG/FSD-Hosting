module.exports = (sequelize, DataTypes) => {
    const RewardClaims = sequelize.define("RewardClaims", {
        claim_Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        reward_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'rewards',
                key: 'reward_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            }
        },
        claimDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
    }, {
        tableName: 'rewardsClaimed',
        timestamps: false //ensure disable timestamps  - terrence
    });

    RewardClaims.associate = (models) => {
        RewardClaims.belongsTo(models.Rewards, {
            foreignKey: "reward_id",
            as: 'rewards'
        });
        RewardClaims.belongsTo(models.User, {
            foreignKey: "user_id",
            as: 'user'
        });
    };

    return RewardClaims;
};
