module.exports = (sequelize, DataTypes) => {
    const EventLocation = sequelize.define("EventLocation", {
        event_location_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        event_location_description: {
            type: DataTypes.STRING(100),
            allowNull: false
        }
    }, {
        tableName: 'eventLocation',
        timestamps: false //ensure disable timestamps  - terrence
    });

    EventLocation.associate = (models) => {
        EventLocation.hasMany(models.Events, {
            foreignKey: "event_location_id",
            as: 'events'
        });
    };

    return EventLocation;
};
