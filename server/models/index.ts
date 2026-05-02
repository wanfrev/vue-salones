import sequelize from '../config/db'
import createUserModel from './User'
import createEmployeeModel from './Employee'

const User = createUserModel(sequelize)
const Employee = createEmployeeModel(sequelize)

User.hasOne(Employee, {
  foreignKey: 'user_id',
  onDelete: 'CASCADE',
})

Employee.belongsTo(User, {
  foreignKey: 'user_id',
})

export { sequelize, User, Employee }
