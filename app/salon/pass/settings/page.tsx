import { getOwnerSalon, NO_SALON_MESSAGE } from '../../_lib/ownerSalon'
import SettingsForm from './SettingsForm'

export const metadata = { title: 'PASS設定 | SalonRink' }

export default async function PassSettingsPage() {
  const salon = await getOwnerSalon()
  if (!salon) {
    return <main style={{ padding: '48px', fontSize: '16px', color: '#3B4656' }}>{NO_SALON_MESSAGE}</main>
  }
  return <SettingsForm salonId={salon.id} salonName={salon.name} />
}
