import { useEffect, useRef, useCallback } from 'react';

export interface MobileBackHandlerConfig {
  isCartOpen: boolean;
  onCloseCart: () => void;
  isVideoOpen: boolean;
  onCloseVideo: () => void;
  isPreviewOpen: boolean;
  onClosePreview: () => void;
  isProfileOpen: boolean;
  onCloseProfile: () => void;
  selectedCategory: string;
  onResetCategory: () => void;
  searchQuery: string;
  onClearSearch: () => void;
}

export function useMobileBackHandler({
  isCartOpen,
  onCloseCart,
  isVideoOpen,
  onCloseVideo,
  isPreviewOpen,
  onClosePreview,
  isProfileOpen,
  onCloseProfile,
  selectedCategory,
  onResetCategory,
  searchQuery,
  onClearSearch,
}: MobileBackHandlerConfig) {
  // Flag to know if close was triggered by UI (X button, backdrop, gesture)
  const isClosingViaUI = useRef<boolean>(false);
  const activeModalRef = useRef<string | null>(null);

  // Determine which modal is currently active (highest priority to lowest)
  let currentActiveModal: string | null = null;
  if (isPreviewOpen) currentActiveModal = 'preview';
  else if (isVideoOpen) currentActiveModal = 'video';
  else if (isCartOpen) currentActiveModal = 'cart';
  else if (isProfileOpen) currentActiveModal = 'profile';

  // Push history state whenever a modal opens
  useEffect(() => {
    const prev = activeModalRef.current;
    activeModalRef.current = currentActiveModal;

    if (currentActiveModal && currentActiveModal !== prev) {
      // A modal opened: push a new history state
      window.history.pushState(
        { appModal: currentActiveModal, timestamp: Date.now() },
        ''
      );
    } else if (!currentActiveModal && prev && !isClosingViaUI.current) {
      // Modal closed, but not via popstate (e.g. state reset elsewhere)
    }

    // Reset UI close flag once state settles
    isClosingViaUI.current = false;
  }, [currentActiveModal]);

  // Handle phone hardware back button / browser back gesture (popstate)
  useEffect(() => {
    const handlePopState = (e: PopStateEvent) => {
      // If closed by UI, we already triggered history.back(), so ignore this pop event
      if (isClosingViaUI.current) {
        isClosingViaUI.current = false;
        return;
      }

      // Close topmost modal
      if (isPreviewOpen) {
        onClosePreview();
      } else if (isVideoOpen) {
        onCloseVideo();
      } else if (isCartOpen) {
        onCloseCart();
      } else if (isProfileOpen) {
        onCloseProfile();
      } else if (selectedCategory !== 'All' || searchQuery.trim().length > 0) {
        // Return to Home All view
        if (searchQuery.trim().length > 0) onClearSearch();
        if (selectedCategory !== 'All') onResetCategory();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    isPreviewOpen,
    onClosePreview,
    isVideoOpen,
    onCloseVideo,
    isCartOpen,
    onCloseCart,
    isProfileOpen,
    onCloseProfile,
    selectedCategory,
    onResetCategory,
    searchQuery,
    onClearSearch,
  ]);

  // Safe programmatic close function for UI components (X button, backdrop, swipe dismiss)
  const handleModalCloseWithHistory = useCallback((closeFn: () => void) => {
    if (activeModalRef.current && window.history.state?.appModal) {
      isClosingViaUI.current = true;
      window.history.back();
    }
    closeFn();
  }, []);

  // Manual back trigger (e.g. for edge swipe gesture)
  const triggerMobileBack = useCallback(() => {
    if (isPreviewOpen) {
      handleModalCloseWithHistory(onClosePreview);
      return true;
    }
    if (isVideoOpen) {
      handleModalCloseWithHistory(onCloseVideo);
      return true;
    }
    if (isCartOpen) {
      handleModalCloseWithHistory(onCloseCart);
      return true;
    }
    if (isProfileOpen) {
      handleModalCloseWithHistory(onCloseProfile);
      return true;
    }
    if (selectedCategory !== 'All' || searchQuery.trim().length > 0) {
      if (searchQuery.trim().length > 0) onClearSearch();
      if (selectedCategory !== 'All') onResetCategory();
      return true;
    }
    return false;
  }, [
    isPreviewOpen,
    onClosePreview,
    isVideoOpen,
    onCloseVideo,
    isCartOpen,
    onCloseCart,
    isProfileOpen,
    onCloseProfile,
    selectedCategory,
    onResetCategory,
    searchQuery,
    onClearSearch,
    handleModalCloseWithHistory,
  ]);

  const hasBackAction = Boolean(
    currentActiveModal ||
    selectedCategory !== 'All' ||
    searchQuery.trim().length > 0
  );

  return {
    handleModalCloseWithHistory,
    triggerMobileBack,
    hasBackAction,
    currentActiveModal,
  };
}
