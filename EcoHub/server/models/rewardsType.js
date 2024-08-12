module.exports = (sequelize, DataTypes) => {
    const RewardsType = sequelize.define("RewardsType", {
        rewards_type_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        rewards_type_description: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        tableName: 'rewardsType',
        timestamps: false //ensure disable timestamps  - terrence
    });

    RewardsType.associate = (models) => {
        RewardsType.hasMany(models.Rewards, {
            foreignKey: "rewards_type_id",
            as: 'rewards'
        });
    };

    return RewardsType;
};
