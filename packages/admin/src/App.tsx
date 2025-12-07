import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/auth';
import MainLayout from '@/layouts/MainLayout';
import Login from '@/pages/Login';
import Dashboard from '@/pages/Dashboard';
import MemberList from '@/pages/member/MemberList';
import MemberDetail from '@/pages/member/MemberDetail';
import LevelList from '@/pages/level/LevelList';
import ProductList from '@/pages/points/ProductList';
import OrderList from '@/pages/points/OrderList';
import ThemeList from '@/pages/checkin/ThemeList';
import RecordList from '@/pages/checkin/RecordList';
import BenefitRules from '@/pages/benefits/BenefitRules';
import MealList from '@/pages/meals/MealList';
import ReferralRules from '@/pages/referral/ReferralRules';
import FeedbackList from '@/pages/feedback/FeedbackList';
import AccountList from '@/pages/system/AccountList';
import RoleList from '@/pages/system/RoleList';
import OperationLogs from '@/pages/system/OperationLogs';

// 路由守卫
const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { token } = useAuthStore();
  return token ? <>{children}</> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <MainLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="members" element={<MemberList />} />
          <Route path="members/:userId" element={<MemberDetail />} />
          <Route path="levels" element={<LevelList />} />
          <Route path="points/products" element={<ProductList />} />
          <Route path="points/orders" element={<OrderList />} />
          <Route path="checkin/themes" element={<ThemeList />} />
          <Route path="checkin/records" element={<RecordList />} />
          <Route path="benefits/rules" element={<BenefitRules />} />
          <Route path="meals" element={<MealList />} />
          <Route path="referral/rules" element={<ReferralRules />} />
          <Route path="feedback" element={<FeedbackList />} />
          <Route path="system/accounts" element={<AccountList />} />
          <Route path="system/roles" element={<RoleList />} />
          <Route path="system/logs" element={<OperationLogs />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
