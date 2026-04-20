import { useEffect } from 'react';

export default function useKeyboardTabs(tabs, setActiveTab) {
  useEffect(() => {
    const onKeydown = (event) => {
      if (!event.ctrlKey) return;
      const idx = Number(event.key);
      if (idx >= 1 && idx <= tabs.length) {
        event.preventDefault();
        setActiveTab(tabs[idx - 1].id);
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [setActiveTab, tabs]);
}
