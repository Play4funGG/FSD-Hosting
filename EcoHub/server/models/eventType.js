module.exports = (sequelize, DataTypes) => {
    const EventType = sequelize.define("EventType", {
        event_type_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        event_type_description: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        tableName: 'eventType',
        timestamps: false //ensure disable timestamps  - terrence
    });

    EventType.associate = (models) => {
        EventType.hasMany(models.Events, {
            foreignKey: "event_type_id",
            as: 'events'
        });
    };

    return EventType;
};
