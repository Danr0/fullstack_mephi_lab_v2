const {Sequelize} = require('sequelize');
const settings = require('./config/config.json').development;
//const argon = require('argon2');
const bcrypt = require('bcrypt');

const sequelize = new Sequelize(settings.database, settings.username, settings.password, {
    host: settings.host,
    dialect: settings.dialect,
    logging: false
});

const userModel = require('./models/user')(sequelize, Sequelize);


async function connectToDatabase() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
}

async function findUser(username) {
    return await userModel.findOne({
        where: {
            username: username
        }
    });
}

async function findUserById(id) {
    return await userModel.findOne({
        where: {
            id: id
        }
    });
}

async function isUserExist(username) {
    let user = await findUser(username);
    return (user !== undefined && user !== null);
}

async function getUserPassword(username) {
    let user = await findUser(username);
    return user.password;
}

async function createNewUser(username, password, phone, gender, desc) {
    const hashedPassword = await bcrypt.hash('myPassword', 20);



        let newUser = userModel.build({
            username: username,
            password: hashedPassword,
            phone_number: phone,
            gender: gender,
            description: desc
        });

        console.log(newUser);

        return await newUser.save();

    return undefined;

}

async function updateData(req, res, next) {

    let user = await findUserById(req.user.id);

    const body = req.body;
    if (body) {
        console.log(body);
        if (body.password) {
            console.log("Changing password");
            user.password = body.password;
        }
        if (body.phone_number) {
            console.log("Changing phone");
            user.phone_number = body.phone_number;
        }
        if (body.gender) {
            user.gender = body.gender;
        }
        if (body.description) {
            user.description = body.description;
        }

        await user.save();
    }


    next();
}

exports.connectToDatabase = connectToDatabase;
exports.sequelize = sequelize;
exports.findUser = findUser;
exports.getUserPassword = getUserPassword;
exports.isUserExist = isUserExist;
exports.User = userModel;
exports.createNewUser = createNewUser;
exports.findUserById = findUserById;
exports.updateData = updateData;