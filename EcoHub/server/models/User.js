module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define("User", {
        user_id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            allowNull: false
        },
        user_type_id:{
            type: DataTypes.INTEGER,
            allowNull: false

        } ,
        first_name: {
            type:DataTypes.STRING(45),
            allowNull: false
        },
        last_name: {
            type:DataTypes.STRING(45),
            allowNull: false
        },
        email: {
            type: DataTypes.STRING(100),
            unique: true,
            validate: 
            {
                isEmail: true
            },
            allowNull: false

        },
        username: {
            type: DataTypes.STRING(100),
            unique: true,
            allowNull: false
        },
        phone_no: {
            type:DataTypes.INTEGER,
        },
        password: {
            type:DataTypes.STRING(1000),
            allowNull: false,
            validate:{
                notEmpty: true,
            },
        },
        location: {
            type:DataTypes.STRING(45),
        },
        profile_image: {
            type: DataTypes.STRING(20),
            allowNull: true // Assuming the profile image is optional
        }
    }, {
        tableName: 'users',
        timestamps: false
    });
    User.associate = (models) => {
        User.hasMany(models.EventSignUp, {
            foreignKey: "user_id",
            as: 'user'
        });
    };
    return User;
}