import { Router } from 'express'
import RouteAuth from './authRouter'
import RouteUserSeeder from './userSeederRoute'
import RouteUserManagementAdmin from './userManagementdminRouter'








const router = Router()

router.use('/auth', RouteAuth)
router.use('/seeder',RouteUserSeeder)
router.use('/userManagementAdmin',RouteUserManagementAdmin)








export default router

