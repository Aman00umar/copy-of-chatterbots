/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import Modal from './Modal';
import { useUI, useUser } from '@/lib/state';
import { useState, useEffect } from 'react';

declare global {
  interface Window {
    electronAPI?: {
      setAutoLaunch: (enabled: boolean) => Promise<{ success: boolean; error?: string }>;
      getAutoLaunchStatus: () => Promise<{ available: boolean; enabled: boolean }>;
    };
  }
}

export default function UserSettings() {
  const { name, info, setName, setInfo } = useUser();
  const { setShowUserConfig } = useUI();
  const [autoLaunchEnabled, setAutoLaunchEnabled] = useState(false);
  const [autoLaunchAvailable, setAutoLaunchAvailable] = useState(false);

  function updateClient() {
    setShowUserConfig(false);
  }

  useEffect(() => {
    // Load auto-launch status on mount
    if (window.electronAPI) {
      window.electronAPI.getAutoLaunchStatus().then((status) => {
        setAutoLaunchAvailable(status.available);
        setAutoLaunchEnabled(status.enabled);
      });
    }
  }, []);

  async function handleAutoLaunchToggle(e: React.ChangeEvent<HTMLInputElement>) {
    const enabled = e.target.checked;
    setAutoLaunchEnabled(enabled);

    if (window.electronAPI) {
      const result = await window.electronAPI.setAutoLaunch(enabled);
      if (!result.success) {
        console.error('Failed to set auto-launch:', result.error);
        setAutoLaunchEnabled(!enabled); // Revert on error
      }
    }
  }

  return (
    <Modal onClose={() => setShowUserConfig(false)}>
      <div className="userSettings">
        <p>
          This is a simple tool that allows you to design, test, and banter with
          custom AI characters on the fly.
        </p>

        <form
          onSubmit={e => {
            e.preventDefault();
            setShowUserConfig(false);
            updateClient();
          }}
        >
          <p>Adding this optional info makes the experience more fun:</p>

          <div>
            <p>Your name</p>
            <input
              type="text"
              name="name"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="What do you like to be called?"
            />
          </div>

          <div>
            <p>Your info</p>
            <textarea
              rows={3}
              name="info"
              value={info}
              onChange={e => setInfo(e.target.value)}
              placeholder="Things we should know about you… Likes, dislikes, hobbies, interests, favorite movies, books, tv shows, foods, etc."
            />
          </div>
          {autoLaunchAvailable && (
            <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid #ccc' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={autoLaunchEnabled}
                  onChange={handleAutoLaunchToggle}
                />
                <span>Start app on boot</span>
              </label>
              <p style={{ fontSize: '0.85rem', marginTop: '0.5rem', color: '#666' }}>
                Automatically launch the app when your computer starts
              </p>
            </div>
          )}
          <button className="button primary">Let’s go!</button>
        </form>
      </div>
    </Modal>
  );
}
