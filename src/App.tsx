import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { GlobalAppHeader } from './components/common/GlobalAppHeader';
import { NotificationToast } from './components/common/NotificationToast';
import { BuyerHeader } from './components/buyer/BuyerHeader';
import { CatalogView } from './components/buyer/CatalogView';
import { TrackingView } from './components/buyer/TrackingView';
import { CabinetView } from './components/buyer/CabinetView';
import { CustomOrderModal } from './components/buyer/CustomOrderModal';
import { DeliveryCalculatorModal } from './components/buyer/DeliveryCalculatorModal';
import { CartDrawer } from './components/buyer/CartDrawer';
import { CheckoutModal } from './components/buyer/CheckoutModal';
import { TelegramBotSimModal } from './components/buyer/TelegramBotSimModal';
import { AdminHeader, AdminTab } from './components/admin/AdminHeader';
import { AdminOrdersTab } from './components/admin/AdminOrdersTab';
import { AdminCartsTab } from './components/admin/AdminCartsTab';
import { AdminInterestsTab } from './components/admin/AdminInterestsTab';
import { AdminCatalogTab } from './components/admin/AdminCatalogTab';
import { AdminBroadcastTab } from './components/admin/AdminBroadcastTab';
import { AdminAnalyticsTab } from './components/admin/AdminAnalyticsTab';
import { AdminSettingsTab } from './components/admin/AdminSettingsTab';
import { OrderDeliveryType } from './types';
import { Smartphone, Sparkles, Bot, ShieldCheck } from 'lucide-react';

const MainAppContent: React.FC = () => {
  const {
    currentMode,
    activeBuyerTab,
    setActiveBuyerTab,
    isTelegramFrame,
  } = useApp();

  // Buyer Modals
  const [isCustomOrderOpen, setIsCustomOrderOpen] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [isBotSimOpen, setIsBotSimOpen] = useState<boolean>(false);

  // Checkout selection
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<OrderDeliveryType>('fast_auto');
  const [selectedPackagingType, setSelectedPackagingType] = useState<'carton' | 'wooden_crate'>('carton');

  // Admin Active Tab
  const [adminTab, setAdminTab] = useState<AdminTab>('orders');
  const [broadcastPresetAudience, setBroadcastPresetAudience] = useState<'all' | 'abandoned_cart'>('all');

  const handleProceedToCheckout = (
    deliveryType: OrderDeliveryType,
    packagingType: 'carton' | 'wooden_crate'
  ) => {
    setSelectedDeliveryType(deliveryType);
    setSelectedPackagingType(packagingType);
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (orderId: string) => {
    setActiveBuyerTab('tracking');
  };

  const handleGoToBroadcastFromCarts = (audience: 'abandoned_cart' | 'all') => {
    setBroadcastPresetAudience(audience);
    setAdminTab('broadcast');
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans">
      {/* Toast notifications */}
      <NotificationToast />

      {/* Global Top App Bar with mode switcher & rates */}
      <GlobalAppHeader onOpenBotSim={() => setIsBotSimOpen(true)} />

      {/* Main Content Area */}
      {currentMode === 'buyer' ? (
        <div className="flex-1 flex flex-col items-center justify-start py-4 px-2 sm:px-4">
          {/* Telegram Smartphone Frame or Full-width Container */}
          <div
            className={`w-full transition-all duration-300 ${
              isTelegramFrame
                ? 'max-w-[440px] bg-neutral-950 border-4 border-neutral-800 rounded-[38px] shadow-2xl overflow-hidden min-h-[860px] flex flex-col my-2 ring-1 ring-neutral-700/50'
                : 'max-w-5xl'
            }`}
          >
            {/* Native Telegram Top Bar simulation (if framed) */}
            {isTelegramFrame && (
              <div className="bg-neutral-900 border-b border-neutral-800/80 px-5 py-2 flex items-center justify-between text-xs text-neutral-400 select-none">
                <div className="font-mono text-[11px] font-semibold text-neutral-300">9:41</div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-medium text-neutral-400">Telegram WebApp</span>
                  <div className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
              </div>
            )}

            {/* Buyer Header */}
            <BuyerHeader
              onOpenCart={() => setIsCartOpen(true)}
              onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
              onOpenCalculator={() => setIsCalculatorOpen(true)}
            />

            {/* Buyer Tab Content */}
            <main className="flex-1 p-3.5 sm:p-5">
              {activeBuyerTab === 'catalog' && (
                <CatalogView
                  onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
                  onOpenCalculator={() => setIsCalculatorOpen(true)}
                />
              )}

              {activeBuyerTab === 'tracking' && <TrackingView />}

              {activeBuyerTab === 'cabinet' && <CabinetView />}
            </main>

            {/* Home indicator bar (if smartphone framed) */}
            {isTelegramFrame && (
              <div className="w-full py-2 bg-neutral-950 flex justify-center border-t border-neutral-900 select-none">
                <div className="w-32 h-1 bg-neutral-700 rounded-full" />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Fullscreen Admin CRM Suite */
        <div className="flex-1 flex flex-col w-full">
          <AdminHeader activeTab={adminTab} setActiveTab={setAdminTab} />

          <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6">
            {adminTab === 'orders' && <AdminOrdersTab />}
            {adminTab === 'carts' && (
              <AdminCartsTab onGoToBroadcast={handleGoToBroadcastFromCarts} />
            )}
            {adminTab === 'interests' && <AdminInterestsTab />}
            {adminTab === 'catalog' && <AdminCatalogTab />}
            {adminTab === 'broadcast' && (
              <AdminBroadcastTab initialAudience={broadcastPresetAudience} />
            )}
            {adminTab === 'analytics' && <AdminAnalyticsTab />}
            {adminTab === 'settings' && <AdminSettingsTab />}
          </main>
        </div>
      )}

      {/* Buyer Modals */}
      <CustomOrderModal
        isOpen={isCustomOrderOpen}
        onClose={() => setIsCustomOrderOpen(false)}
        onSuccess={() => setActiveBuyerTab('tracking')}
      />

      <DeliveryCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleProceedToCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        deliveryType={selectedDeliveryType}
        packagingType={selectedPackagingType}
        onOrderSuccess={handleOrderSuccess}
      />

      <TelegramBotSimModal
        isOpen={isBotSimOpen}
        onClose={() => setIsBotSimOpen(false)}
        onOpenWebAppTab={(tab) => {
          if (tab === 'calculator') {
            setIsCalculatorOpen(true);
          } else {
            setActiveBuyerTab(tab);
          }
        }}
        onOpenCustomOrder={() => setIsCustomOrderOpen(true)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
