import { Router } from 'express'
import RouteAuth from './authRouter'
import RouteUserSeeder from './userSeederRoute'
import RouteUserManagementAdmin from './userManagementdminRouter'
import RoutePasienManagement from './pasienManagementRouter'
import RouteRekamMedis from './rekamMedisRouter'
import RoutePeminjamanRekamMedis  from './peminajamanRekamMedisRoute'
import RouterCheckStatusPeminjamanRM from './checkStatusPeminjamanRMRouter'
import RouterLogAcitivity from './logActivityRouter'

import { getCounts } from '../../controller/dashboardCount'
import { checkJwt } from '../../utils/checkJwt'









const router = Router()

router.use('/auth', RouteAuth)
router.use('/seeder',RouteUserSeeder)
router.use('/userManagementAdmin',RouteUserManagementAdmin)
router.use('/pasienManagement',RoutePasienManagement)
router.use('/rekamMedis',RouteRekamMedis)
router.use('/peminjamanRekamMedis',RoutePeminjamanRekamMedis)
router.use('/checkStatuspeminjamanRekamMedis',RouterCheckStatusPeminjamanRM)
router.get('/countDashboard', [checkJwt,getCounts])
router.use('/logActivity',RouterLogAcitivity)




export default router

