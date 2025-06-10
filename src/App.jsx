import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";

import AdminDashboard from "./pages/AdminDashboard";
import AddAndManageBuisness from "./pages/AddAndManageBuisness";
import AddManageCity from "./pages/AddManageCity";
import AddAndManageCategory from "./pages/AddAndManageCategory";
import AddAndManageSource from "./pages/AddAndManageSource";
import AddAndManageCandidate from "./pages/AddAndManageCandidate";
import AddAndManageEmployee from "./pages/AddAndManageEmployee";
import AddAndManageUser from "./pages/AddAndManageUser";
import AddAndManageTarget from "./pages/AddAndManageTarget";
import LoginPage from "./pages/Login";
import TelecallerDashboard from "./pages/telecaller/TelecallerDashboard";
import TelecallerBusiness from "./pages/telecaller/TelecallerBusiness";
import BdeDashboard from "./pages/bde/BdeDashboard";
import BdeBusiness from "./pages/bde/BdeBusiness";
import DigitalDashboard from "./pages/digitalmarketer/DigitalDashboard";
import DigitalBusiness from "./pages/digitalmarketer/DigitalBusiness";
import AddAndManageAssignBusiness from "./pages/AddAndManageAssignBusiness";
import BdeCallingDataPage from "./pages/bde/BdeCallingDataPage";
import DigitalMarketerCallingDataPage from "./pages/digitalmarketer/DigitalMarketerCallingDataPage";
import TelecallerAchievement from "./pages/telecaller/TelecallerAchievement";
import BdeAchievement from "./pages/bde/BdeAchievement";
import DigitalMarketerAchievement from "./pages/digitalmarketer/DigitalMarketerAchievement";
import EmployeeDetails from "./component/adminbuisness/EmployeeDetails";
import TelecallerCallingData from "./component/telecaller/TelecallerCallingData";
import TelecallerCallingDataPage from "./pages/telecaller/TelecallerCallingDataPage";
import WhatsappProposal from "./pages/WhatsappProposal";
import WhatsAppTemplateImageUpload from "./pages/WhatsAppTemplateImageUpload";
import Proposal from "./pages/Proposal";
import AdminProposalData from "./pages/AdminProposalData";
import WebsiteLeads from "./pages/websiteleads/WebsiteLeads";
import AddAndManageBlog from "./pages/blog/AddAndManageBlog";
import Career from "./pages/careerjobpost/Career";
import AllApplication from "./pages/careerjobpost/AllApplication";
import AddAndManageAchievement from "./pages/AddAndManageAchievement";

function App() {
  return (
    <Routes>
      <Route path="" element={<LoginPage />} />
      {/* admin Part */}
      <Route path="/admin/dashboard" element={<AdminDashboard />} />
      <Route
        path="/admin/business/add-manage-business"
        element={<AddAndManageBuisness />}
      />
      <Route
        path="/admin/business/add-manage-city-town"
        element={<AddManageCity />}
      />
      <Route
        path="/admin/business/add-manage-categories"
        element={<AddAndManageCategory />}
      />
      <Route
        path="/admin/business/add-manage-source"
        element={<AddAndManageSource />}
      />
      <Route
        path="/admin/hr/add-manage-candidate"
        element={<AddAndManageCandidate />}
      />
      <Route
        path="/admin/hr/add-manage-employees"
        element={<AddAndManageEmployee />}
      />
      <Route
        path="/admin/user/add-manage-user"
        element={<AddAndManageUser />}
      />
      <Route
        path="/admin/sales/add-manage-target"
        element={<AddAndManageTarget />}
      />
      <Route
        path="/admin/sales/add-manage-achievement"
        element={<AddAndManageAchievement />}
      />
      <Route
        path="/admin/user/add-manage-assign-business"
        element={<AddAndManageAssignBusiness />}
      />
      <Route path="/employee-details/:role/:id" element={<EmployeeDetails />} />
      <Route path="/employee-details/:role/:id" element={<EmployeeDetails />} />
      <Route path="/admin/brodcast/marketing" element={<WhatsappProposal />} />
      <Route
        path="/admin/brodcast/template-image-manage"
        element={<WhatsAppTemplateImageUpload />}
      />
      <Route path="/admin/brodcast/single-massage" element={<Proposal />} />
      <Route path="/admin/sales/proposal" element={<AdminProposalData />} />
      <Route
        path="/admin/getquotation/websiteleads"
        element={<WebsiteLeads />}
      />
      <Route
        path="/admin/blog/addandmanageblog"
        element={<AddAndManageBlog />}
      />
      <Route path="/admin/career/addandmanagecareer" element={<Career />} />
      <Route path="/admin/career/applications" element={<AllApplication />} />

      {/* Telecaller */}
      <Route
        path="/telecaler/telecaller-dashboard/:telecallerId"
        element={<TelecallerDashboard />}
      />
      <Route
        path="/telecaler/business/:telecallerId"
        element={<TelecallerBusiness />}
      />
      <Route
        path="/telecaler/calling-data/:telecallerId"
        element={<TelecallerCallingDataPage />}
      />

      <Route
        path="/telecaler/achivement/:telecallerId"
        element={<TelecallerAchievement />}
      />

      {/* BDE */}
      <Route path="/bde/bde-dashboard/:bdeId" element={<BdeDashboard />} />
      <Route path="/bde/business/:bdeId" element={<BdeBusiness />} />
      <Route path="/bde/callingdata/:bdeId" element={<BdeCallingDataPage />} />

      <Route path="/bde/achievement/:bdeId" element={<BdeAchievement />} />

      {/* digital marketer */}
      <Route
        path="/digitalmarketer/digitalmarketer-dashboard/:digitalMarketerId"
        element={<DigitalDashboard />}
      />
      <Route
        path="/digitalmarketer/business/:digitalMarketerId"
        element={<DigitalBusiness />}
      />
      <Route
        path="/digitalmarketer/calling-data/:digitalMarketerId"
        element={<DigitalMarketerCallingDataPage />}
      />
      <Route
        path="/digitalmarketer/achievement/:digitalMarketerId"
        element={<DigitalMarketerAchievement />}
      />
    </Routes>
  );
}

export default App;
