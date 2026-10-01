import { getOwnerSalon, NO_SALON_MESSAGE } from '../../_lib/ownerSalon'
import StatsView from './StatsView'

export const metadata = { title: '導入効果 | SalonRink' }

export default async function PassStatsPage() {
  const salon = await getOwnerSalon()
  if (!salon) {
    return <main style={{ padding: '48px', fontSize: '16px', color: '#3B4656' }}>{NO_SALON_MESSAGE}</main>
  }
  return <StatsView salonId={salon.id} salonName={salon.name} />
}
