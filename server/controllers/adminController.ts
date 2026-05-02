import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { Op } from 'sequelize'
import { Employee, User, sequelize } from '../models'
import { isRole, ROLES, type Role } from '../constants/roles'

interface CreateEmployeeByAdminPayload {
  username?: string
  password?: string
  role?: Role | string
  first_name?: string
  firstName?: string
  last_name?: string
  lastName?: string
  position?: string
}

const PRIVILEGED_ROLES: Role[] = [ROLES.ADMIN, ROLES.SUPERADMIN]

const isSuperadmin = (role?: Role): boolean => {
  return role === ROLES.SUPERADMIN
}

const canCreateRoleByActor = (actorRole: Role, targetRole: Role): boolean => {
  if (targetRole === ROLES.EMPLEADO || targetRole === ROLES.ADMIN) {
    return actorRole === ROLES.ADMIN || actorRole === ROLES.SUPERADMIN
  }

  if (targetRole === ROLES.SUPERADMIN) {
    return actorRole === ROLES.SUPERADMIN
  }

  return false
}

const normalizeText = (value: string): string => {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase()
}

export const createEmployeeByAdmin = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction()

  try {
    const actorRole = req.user?.rol

    if (!actorRole) {
      await transaction.rollback()
      return res.status(401).json({ message: 'Usuario autenticado no valido.' })
    }

    const payload = req.body as CreateEmployeeByAdminPayload

    const username = String(payload.username ?? '')
      .trim()
      .toLowerCase()
    const password = String(payload.password ?? '')
    const requestedRole = String(payload.role ?? ROLES.EMPLEADO).trim().toLowerCase()
    const role: Role = isRole(requestedRole) ? requestedRole : ROLES.EMPLEADO
    const firstName = String(payload.first_name ?? payload.firstName ?? '').trim()
    const lastName = String(payload.last_name ?? payload.lastName ?? '').trim()
    const position = String(payload.position ?? '').trim()

    if (!username || !password) {
      await transaction.rollback()
      return res.status(400).json({ message: 'username y password son obligatorios.' })
    }

    if (!isRole(requestedRole)) {
      await transaction.rollback()
      return res.status(400).json({ message: 'role debe ser superadmin, admin o empleado.' })
    }

    if (!canCreateRoleByActor(actorRole, role)) {
      await transaction.rollback()
      return res.status(403).json({
        message:
          role === ROLES.SUPERADMIN
            ? 'Solo un superadmin puede crear usuarios superadmin.'
            : 'No tienes permisos para crear usuarios con ese rol.',
      })
    }

    if (role === ROLES.EMPLEADO && (!firstName || !lastName)) {
      await transaction.rollback()
      return res.status(400).json({
        message: 'Para rol empleado, first_name y last_name son obligatorios.',
      })
    }

    if (password.length < 8) {
      await transaction.rollback()
      return res.status(400).json({ message: 'La contrasena debe tener al menos 8 caracteres.' })
    }

    const existingUser = await User.findOne({
      where: { username },
      transaction,
    })

    if (existingUser) {
      await transaction.rollback()
      return res.status(409).json({ message: 'El username ya existe.' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const newUser = await User.create(
      {
        username,
        password_hash: passwordHash,
        role,
      },
      { transaction },
    )

    let employeeId: number | null = null

    if (role === ROLES.EMPLEADO) {
      const newEmployee = await Employee.create(
        {
          user_id: newUser.getDataValue('id'),
          quickbooks_id: null,
          first_name: firstName,
          last_name: lastName,
          position: position || null,
          base_salary: null,
        },
        { transaction },
      )

      employeeId = Number(newEmployee.getDataValue('id'))
    }

    await transaction.commit()

    return res.status(201).json({
      message:
        role === ROLES.SUPERADMIN
          ? 'Superadmin creado correctamente.'
          : role === ROLES.ADMIN
            ? 'Administrador creado correctamente.'
            : 'Empleado y usuario creados correctamente.',
      data: {
        username,
        role,
        employee: role === ROLES.EMPLEADO ? `${firstName} ${lastName}` : undefined,
        employee_id: employeeId,
      },
    })
  } catch (error) {
    await transaction.rollback()

    return res.status(400).json({
      message: 'Error al crear el usuario.',
      error: error instanceof Error ? error.message : 'Error desconocido',
    })
  }
}

export const getEmployeesAdmin = async (req: Request, res: Response) => {
  try {
    const search = normalizeText(String(req.query.search ?? ''))

    const employees = await Employee.findAll({
      include: [
        {
          model: User,
          required: true,
          attributes: ['id', 'username', 'role'],
          where: { role: ROLES.EMPLEADO },
        },
      ],
      attributes: ['id', 'first_name', 'last_name', 'position'],
      order: [
        ['first_name', 'ASC'],
        ['last_name', 'ASC'],
        ['id', 'ASC'],
      ],
    })

    const payload = employees
      .map((employee) => {
        const data = employee.toJSON() as Record<string, unknown>
        const userData = data.User as Record<string, unknown> | undefined
        const employeeId = Number(data.id || 0)
        const firstName = String(data.first_name ?? '').trim()
        const lastName = String(data.last_name ?? '').trim()
        const nombre = `${firstName} ${lastName}`.trim() || String(userData?.username ?? 'Empleado')

        return {
          employeeId,
          nombre,
          username: String(userData?.username ?? '').trim(),
          position: String(data.position ?? '').trim(),
        }
      })
      .filter((item) => {
        if (!search) {
          return true
        }

        const searchable = normalizeText([item.nombre, item.username, item.position].filter(Boolean).join(' '))
        return searchable.includes(search)
      })

    return res.json({ data: payload })
  } catch {
    return res.status(500).json({ msg: 'Error al consultar empleados.' })
  }
}

export const updateEmployeePasswordByAdmin = async (req: Request, res: Response) => {
  try {
    const employeeId = Number(req.params.employeeId)
    const password = String(req.body?.password ?? '')

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      return res.status(400).json({ msg: 'employeeId invalido.' })
    }

    if (!password.trim() || password.trim().length < 8) {
      return res.status(400).json({ msg: 'La contrasena debe tener al menos 8 caracteres.' })
    }

    const employee = await Employee.findByPk(employeeId)

    if (!employee) {
      return res.status(404).json({ msg: 'Empleado no encontrado.' })
    }

    const userId = Number(employee.getDataValue('user_id') || 0)

    if (!userId) {
      return res.status(404).json({ msg: 'Usuario asociado no encontrado.' })
    }

    const user = await User.findOne({
      where: {
        id: userId,
        role: ROLES.EMPLEADO,
      },
    })

    if (!user) {
      return res.status(404).json({ msg: 'Usuario empleado no encontrado.' })
    }

    const passwordHash = await bcrypt.hash(password.trim(), 10)
    user.set('password_hash', passwordHash)
    await user.save()

    return res.json({
      msg: 'Contrasena actualizada correctamente.',
      employeeId,
    })
  } catch {
    return res.status(500).json({ msg: 'No fue posible actualizar la contrasena del empleado.' })
  }
}

export const deleteEmployeeByAdmin = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction()

  try {
    const employeeId = Number(req.params.employeeId)

    if (!Number.isInteger(employeeId) || employeeId <= 0) {
      await transaction.rollback()
      return res.status(400).json({ msg: 'employeeId invalido.' })
    }

    const employee = await Employee.findByPk(employeeId, { transaction })

    if (!employee) {
      await transaction.rollback()
      return res.status(404).json({ msg: 'Empleado no encontrado.' })
    }

    const userId = Number(employee.getDataValue('user_id') || 0)

    if (!userId) {
      await transaction.rollback()
      return res.status(404).json({ msg: 'Usuario asociado no encontrado.' })
    }

    const employeeName = `${String(employee.getDataValue('first_name') ?? '').trim()} ${String(
      employee.getDataValue('last_name') ?? '',
    ).trim()}`.trim()

    const deletedUsers = await User.destroy({
      where: {
        id: userId,
        role: ROLES.EMPLEADO,
      },
      transaction,
    })

    if (deletedUsers === 0) {
      await transaction.rollback()
      return res.status(404).json({ msg: 'Usuario empleado no encontrado.' })
    }

    await transaction.commit()

    return res.json({
      msg: 'Empleado eliminado correctamente.',
      employee: {
        id: employeeId,
        nombre: employeeName || 'Empleado',
      },
    })
  } catch {
    await transaction.rollback()
    return res.status(500).json({ msg: 'No fue posible eliminar al empleado.' })
  }
}

export const getPrivilegedUsersBySuperadmin = async (req: Request, res: Response) => {
  try {
    if (!isSuperadmin(req.user?.rol)) {
      return res.status(403).json({ msg: 'Solo un superadmin puede ver usuarios admin/superadmin.' })
    }

    const users = await User.findAll({
      where: {
        role: {
          [Op.in]: PRIVILEGED_ROLES,
        },
      },
      attributes: ['id', 'username', 'role', 'createdAt', 'updatedAt'],
      order: [
        ['role', 'ASC'],
        ['username', 'ASC'],
      ],
    })

    return res.json({
      data: users.map((user) => {
        const id = Number(user.getDataValue('id'))
        const role = user.getDataValue('role') as Role

        return {
          id,
          username: String(user.getDataValue('username') ?? ''),
          role,
          createdAt: user.getDataValue('createdAt'),
          updatedAt: user.getDataValue('updatedAt'),
          canDelete: req.user?.id !== id,
        }
      }),
    })
  } catch {
    return res.status(500).json({ msg: 'No fue posible consultar usuarios admin/superadmin.' })
  }
}

export const deletePrivilegedUserBySuperadmin = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction()

  try {
    if (!isSuperadmin(req.user?.rol)) {
      await transaction.rollback()
      return res.status(403).json({ msg: 'Solo un superadmin puede eliminar usuarios admin/superadmin.' })
    }

    const userId = Number(req.params.userId)

    if (!Number.isInteger(userId) || userId <= 0) {
      await transaction.rollback()
      return res.status(400).json({ msg: 'userId invalido.' })
    }

    if (userId === req.user.id) {
      await transaction.rollback()
      return res.status(400).json({ msg: 'No puedes eliminar tu propio usuario.' })
    }

    const user = await User.findOne({
      where: {
        id: userId,
        role: {
          [Op.in]: PRIVILEGED_ROLES,
        },
      },
      transaction,
    })

    if (!user) {
      await transaction.rollback()
      return res.status(404).json({ msg: 'Usuario admin/superadmin no encontrado.' })
    }

    const username = String(user.getDataValue('username') ?? '')
    const role = user.getDataValue('role') as Role

    await user.destroy({ transaction })

    await transaction.commit()

    return res.json({
      msg: 'Usuario admin/superadmin eliminado correctamente.',
      user: {
        id: userId,
        username,
        role,
      },
    })
  } catch {
    await transaction.rollback()
    return res.status(500).json({ msg: 'No fue posible eliminar el usuario admin/superadmin.' })
  }
}
