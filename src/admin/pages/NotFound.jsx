import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import Panel from '../components/ui/Panel'
import EmptyState from '../components/ui/EmptyState'
import Button from '../components/ui/Button'

export default function AdminNotFound() {
  const navigate = useNavigate()
  return (
    <Panel>
      <EmptyState
        icon={Compass}
        title="There is no screen at this address"
        description="The link may be out of date, or the screen may have been renamed."
        action={<Button variant="primary" onClick={() => navigate('/admin')}>Go to the overview</Button>}
      />
    </Panel>
  )
}
