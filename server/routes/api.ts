import express from 'express'
import auth from '../middleware/auth'
import roleAuth from '../middleware/roleAuth'
import { login } from '../controllers/authController'
import {
	createEmployeeByAdmin,
	deleteEmployeeByAdmin,
	deletePrivilegedUserBySuperadmin,
	getEmployeesAdmin,
	getPrivilegedUsersBySuperadmin,
	updateEmployeePasswordByAdmin,
} from '../controllers/adminController'
import { ROLES } from '../constants/roles'

const router = express.Router()
const ADMIN_PANEL_ROLES = [ROLES.ADMIN, ROLES.SUPERADMIN]

router.post('/login', login)
router.post('/admin/empleados', auth, roleAuth(ADMIN_PANEL_ROLES), createEmployeeByAdmin)
router.get('/admin/empleados', auth, roleAuth(ADMIN_PANEL_ROLES), getEmployeesAdmin)
router.patch('/admin/empleados/:employeeId/password', auth, roleAuth(ADMIN_PANEL_ROLES), updateEmployeePasswordByAdmin)
router.delete('/admin/empleados/:employeeId', auth, roleAuth(ADMIN_PANEL_ROLES), deleteEmployeeByAdmin)
router.get('/admin/privileged-users', auth, roleAuth(ADMIN_PANEL_ROLES), getPrivilegedUsersBySuperadmin)
router.delete('/admin/privileged-users/:userId', auth, roleAuth(ADMIN_PANEL_ROLES), deletePrivilegedUserBySuperadmin)

export default router
