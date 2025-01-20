import { Router } from 'express'
import RouteAuth from './authRouter'
import RouteUserSeeder from './userSeederRoute'
import RouteUserManagementAdmin from './userManagementdminRouter'
import RoutePasienManagement from './pasienManagementRouter'
import RouteRekamMedis from './rekamMedisRouter'









const router = Router()

router.use('/auth', RouteAuth)
router.use('/seeder',RouteUserSeeder)
router.use('/userManagementAdmin',RouteUserManagementAdmin)
router.use('/pasienManagement',RoutePasienManagement)
router.use('/rekamMedis',RouteRekamMedis)









export default router

