import { useAppStore } from '@/store/appStore';
import Navigation from '@/components/Navigation';
import Toast from '@/components/Toast';
import TouristPage from '@/pages/TouristPage';
import RentalPage from '@/pages/RentalPage';
import CoachPage from '@/pages/CoachPage';

export default function Home() {
  const { currentRole } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main>
        {currentRole === 'tourist' && <TouristPage />}
        {currentRole === 'rental' && <RentalPage />}
        {currentRole === 'coach' && <CoachPage />}
      </main>
      
      <Toast />
    </div>
  );
}
