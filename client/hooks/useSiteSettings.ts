import { useState, useEffect } from "react";
import type { SiteSettings, SiteSettingsRow } from "../lib/siteSettingsTypes";
import {
  DEFAULT_SITE_SETTINGS,
  rowToSiteSettings,
} from "../../lib/siteSettingsTypes";

// Supabase configuration
const SUPABASE_URL = "https://frncxsyzrtzwswnmbvtn.supabase.co";
const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZybmN4c3l6cnR6d3N3bm1idnRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNDQ3MjYsImV4cCI6MjA4NTYyMDcyNn0.0qim3QrVOvjxTioWxzV1haFwWaM4TWLrplMOQ86dH0U";

interface UseSiteSettingsResult {
  settings: SiteSettings;
  isLoading: boolean;
  error: Error | null;
}

// Global cache for site settings (singleton pattern)
let settingsCache: SiteSettings | null = null;
let fetchPromise: Promise<SiteSettings> | null = null;

export function useSiteSettings(): UseSiteSettingsResult {
  const [settings, setSettings] = useState<SiteSettings>(
    settingsCache || DEFAULT_SITE_SETTINGS,
  );
  const [isLoading, setIsLoading] = useState(!settingsCache);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchSettings() {
      // If already cached, use it
      if (settingsCache) {
        if (isMounted) {
          setSettings(settingsCache);
          setIsLoading(false);
        }
        return;
      }

      // If fetch is already in progress, wait for it
      if (fetchPromise) {
        try {
          const result = await fetchPromise;
          if (isMounted) {
            setSettings(result);
            setIsLoading(false);
          }
        } catch (err) {
          if (isMounted) {
            setError(err instanceof Error ? err : new Error("Unknown error"));
            setIsLoading(false);
          }
        }
        return;
      }

      // Start new fetch
      fetchPromise = (async () => {
        // Use the public view which excludes sensitive fields (analytics IDs, scripts)
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/site_settings_public?settings_key=eq.global&select=*`,
          {
            headers: {
              apikey: SUPABASE_ANON_KEY,
              Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error: ${response.status}`);
        }

        const data = await response.json();

        if (!Array.isArray(data) || data.length === 0) {
          // No settings in DB yet, use defaults
          return DEFAULT_SITE_SETTINGS;
        }

        const row = data[0] as SiteSettingsRow;
        return rowToSiteSettings(row);
      })();

      try {
        const result = await fetchPromise;
        settingsCache = result;

        if (isMounted) {
          setSettings(result);
          setError(null);
        }
      } catch (err) {
        console.error("[useSiteSettings] Error:", err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error("Unknown error"));
          // Still use defaults on error
          setSettings(DEFAULT_SITE_SETTINGS);
        }
      } finally {
        fetchPromise = null;
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return {
    settings,
    isLoading,
    error,
  };
}

// Helper to clear cache (call after admin saves settings)
export function clearSiteSettingsCache() {
  settingsCache = null;
  fetchPromise = null;
}

// Helper to get the global phone number (for pages that want to use it)
export function useGlobalPhone() {
  const { settings, isLoading } = useSiteSettings();

  return {
    phoneNumber: settings.phoneNumber,
    phoneDisplay: settings.phoneDisplay,
    phoneAvailability: settings.phoneAvailability,
    applyGlobally: settings.applyPhoneGlobally,
    isLoading,
  };
}
