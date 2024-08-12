module.exports = (sequelize, DataTypes) => {
    const EventSignUp = sequelize.define("EventSignUp", {
        SignUpId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        event_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'events',
                key: 'event_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            references: {
                model: 'User',
                key: 'user_id'
            }
        },
        SignUpDate: {
            type: DataTypes.DATE,
            allowNull: false
        },
        status: {
            type: DataTypes.ENUM('unregistered', 'registered'),
            allowNull: false,
            defaultValue: 'registered'
        },
        attendance: {
            type: DataTypes.ENUM('marked', 'not_marked'),
            allowNull: false,
            defaultValue: 'not_marked'
        },
    }, {
        tableName: 'eventSignUp',
        timestamps: false //ensure disable timestamps  - terrence
    });

    EventSignUp.associate = (models) => {
        EventSignUp.belongsTo(models.Events, {
            foreignKey: "event_id",
            as: 'events'
        });
        EventSignUp.belongsTo(models.User, {
            foreignKey: "user_id",
            as: 'user'
        });
    };

    return EventSignUp;
};
