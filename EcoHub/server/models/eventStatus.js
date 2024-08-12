module.exports = (sequelize, DataTypes) => {
    const EventStatus = sequelize.define("EventStatus", {
        event_status_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        description: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        tableName: 'eventStatus',
        timestamps: false //ensure disable timestamps  - terrence
    });

    EventStatus.associate = (models) => {
        EventStatus.hasMany(models.Events, {
            foreignKey: "event_status_id",
            as: 'events'
        });
    };

    return EventStatus;
};
