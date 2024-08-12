module.exports = (sequelize, DataTypes) => {
    const Events = sequelize.define("Events", {
        event_id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        event_type_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'eventType',
                key: 'event_type_id'
            }
        },
        event_title: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        event_start_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        event_location_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'eventLocation',
                key: 'event_location_id'
            }
        },
        reward_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'rewards',
                key: 'reward_id'
            }
        },
        event_end_time: {
            type: DataTypes.TIME,
            allowNull: false
        },
        event_description: {
            type: DataTypes.STRING(1000),
            allowNull: false
        },
        event_cat_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'eventCategory',
                key: 'event_cat_id'
            }
        },
        event_date: {
            type: DataTypes.DATE,
            allowNull: false
        },
        event_status_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'eventStatus',
                key: 'event_status_id'
            }
        },
        user_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'User',
                key: 'user_id'
            }
        },
        imageFile: {
            type: DataTypes.STRING(20)
        },
        signup_limit: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
    }, {
        tableName: 'events',
        timestamps: false //ensure disable timestamps  - terrence
    });

    Events.associate = (models) => {
        Events.hasMany(models.EventSignUp, {
            foreignKey: "event_id",
            as: 'signups'
        });
        Events.belongsTo(models.EventType, {
            foreignKey: "event_type_id",
            as: 'eventType'
        });
        Events.belongsTo(models.EventLocation, {
            foreignKey: "event_location_id",
            as: 'eventLocation'
        });
        Events.belongsTo(models.Rewards, {
            foreignKey: "reward_id",
            as: 'reward'
        });
        Events.belongsTo(models.EventCategory, {
            foreignKey: "event_cat_id",
            as: 'eventCategory'
        });
        Events.belongsTo(models.EventStatus, {
            foreignKey: "event_status_id",
            as: 'eventStatus'
        });
        Events.belongsTo(models.User, {
            foreignKey: "user_id",
            as: 'user'
        });
    };

    return Events;
};
