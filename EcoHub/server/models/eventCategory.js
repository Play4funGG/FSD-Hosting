module.exports = (sequelize, DataTypes) => {
    const EventCategory = sequelize.define("EventCategory", {
        event_cat_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        event_cat_description: {
            type: DataTypes.STRING(45),
            allowNull: false
        }
    }, {
        tableName: 'eventCategory',
        timestamps: false //ensure disable timestamps  - terrence
    });

    EventCategory.associate = (models) => {
        EventCategory.hasMany(models.Events, {
            foreignKey: "event_cat_id",
            as: 'events'
        });
    };

    return EventCategory;
};
