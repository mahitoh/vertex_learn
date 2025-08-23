import { Bell, HelpCircle, Menu, PanelLeftClose, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeaderProps {
  onMenuToggle: () => void;
  isMobile: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  sidebarWidth?: number;
}

export default function Header({ 
  onMenuToggle, 
  isMobile, 
  isCollapsed = false, 
  onToggleCollapse,
  sidebarWidth = 256
}: HeaderProps) {
  const leftMargin = isMobile ? 0 : (isCollapsed ? 64 : sidebarWidth);

  return (
    <header className="bg-white border-b border-gray-200 h-16 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center space-x-2 sm:space-x-4">
        {isMobile ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={onMenuToggle}
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2"
            data-testid="button-mobile-menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        ) : (
          <div 
            className="flex items-center space-x-2 transition-all duration-300"
            style={{ marginLeft: `${leftMargin}px` }}
          >
            {onToggleCollapse && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggleCollapse}
                className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2 mr-2"
                data-testid="button-toggle-sidebar"
              >
                {isCollapsed ? <PanelLeft className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
              </Button>
            )}
            <span className="text-gray-400 text-sm">📋</span>
            <span className="text-gray-400 text-sm">📱</span>
            <span className="text-gray-400 text-sm">💻</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center space-x-1 sm:space-x-4">
        {!isMobile && (
          <Button 
            variant="ghost"
            size="sm"
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 text-sm"
            data-testid="button-subscription"
          >
            Subscription
          </Button>
        )}
        {!isMobile && (
          <Button 
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2"
            data-testid="button-edit-application"
          >
            ✏️
          </Button>
        )}
        <Button 
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2"
          data-testid="button-help"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-800 hover:bg-gray-100 p-2"
          data-testid="button-notifications"
        >
          <Bell className="h-4 w-4" />
        </Button>
        <div className="flex items-center space-x-2">
          {!isMobile && (
            <span className="text-sm text-gray-700 font-medium" data-testid="text-username">Kevin</span>
          )}
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100" 
            alt="User Profile"
            className="w-8 h-8 rounded-full border-2 border-gray-300 object-cover"
            data-testid="img-user-avatar"
          />
        </div>
      </div>
    </header>
  );
}