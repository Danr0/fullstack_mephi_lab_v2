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

async function isUserExistById(id) {
    let user = await findUserById(id);
    return (user !== undefined && user !== null);
}

async function getUserPassword(username) {
    let user = await findUser(username);
    return user.password;
}

async function deleteUserById(id){
    let user = await findUserById(id);
    await user.destroy();
}

async function createNewUser(username, password, is_admin=false) {
    const hashedPassword = await bcrypt.hash(password, 10)

        let newUser = userModel.build({
            username: username,
            password: hashedPassword,
            is_admin: is_admin
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
            const hashedPassword = await bcrypt.hash(body.password, 10);
            console.log("Changing password");
            user.password = hashedPassword;
        }

        await user.save();
    }

    next();
}

async function updateDataById(id, password) {

    let user = await findUserById(id);
    console.log(password);
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            console.log("Changing password");
            user.password = hashedPassword;
        }

        await user.save();


}


async function updateAdmin(user){
    await userModel.update(
        { is_admin: true },
        { where: { username: user } }
    )
        .then(result =>
            console.log(result)
        )
        .catch(err =>
            console.log(err)
        )
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
exports.updateAdmin = updateAdmin;
exports.deleteUserById = deleteUserById;
exports.updateDataById = updateDataById;
exports.isUserExistById = isUserExistById;