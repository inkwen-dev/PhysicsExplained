/**
 * Support configuration for donation platforms
 * Supports Ko-fi and Buy Me a Coffee platforms
 */

export interface SupportConfig {
  enabled: boolean;              // Whether to enable support feature
  platforms: {
    koFi: {
      enabled: boolean;           // Enable Ko-fi platform
      username: string;           // Ko-fi username (e.g., 'humannatureexplained')
      url?: string;               // Optional: custom Ko-fi URL
    };
    buyMeACoffee: {
      enabled: boolean;           // Enable Buy Me a Coffee platform
      username: string;           // Buy Me a Coffee username (e.g., 'humannatureexplained')
      url?: string;               // Optional: custom BMC URL
    };
  };
  texts: {
    title: string;               // Main title
    subtitle: string;            // Subtitle
    koFiButtonText?: string;     // Optional: Ko-fi button text
    bmcButtonText?: string;      // Optional: BMC button text
  };
}

export const supportConfig: SupportConfig = {
  enabled: true,
  platforms: {
    koFi: {
      enabled: true,
      username: 'inkwen_dev',  // ⚠️ Replace with your Ko-fi username
      // url: 'https://ko-fi.com/your-ko-fi-username',  // Optional: custom URL
    },
    buyMeACoffee: {
      enabled: false,
      username: '',     // ⚠️ Replace with your Buy Me a Coffee username
      // url: 'https://buymeacoffee.com/your-bmc-username',  // Optional: custom URL
    },
  },
  texts: {
    title: 'Enjoyed This Article?',
    subtitle: 'Your support helps us create more free physics content. Every contribution makes a difference.',
    koFiButtonText: 'Support',
    bmcButtonText: 'Buy Me a Coffee',
  },
};

/**
 * Get support configuration
 */
export function getSupportConfig(): SupportConfig {
  return supportConfig;
}

/**
 * Check if support feature is enabled
 */
export function isSupportEnabled(): boolean {
  return supportConfig.enabled;
}

/**
 * Validate username (internal helper function)
 * Checks if username is valid (not empty and not a placeholder)
 */
function isValidUsername(username: string, placeholder: string): boolean {
  return Boolean(username && 
    username !== placeholder && 
    username.trim() !== '');
}

/**
 * Validate support configuration
 * Returns true if at least one platform is enabled and configured, false otherwise
 */
export function validateSupportConfig(): boolean {
  if (!supportConfig.enabled) {
    return false;
  }
  
  const koFiValid = supportConfig.platforms.koFi.enabled && 
    isValidUsername(supportConfig.platforms.koFi.username, 'your-ko-fi-username');
  
  const bmcValid = supportConfig.platforms.buyMeACoffee.enabled && 
    isValidUsername(supportConfig.platforms.buyMeACoffee.username, 'your-bmc-username');
  
  return koFiValid || bmcValid;
}

/**
 * Get enabled platforms
 * Returns array of enabled platform names
 * Only returns platforms that are enabled AND have valid usernames
 */
export function getEnabledPlatforms(): Array<'ko-fi' | 'buy-me-a-coffee'> {
  const platforms: Array<'ko-fi' | 'buy-me-a-coffee'> = [];
  
  if (supportConfig.platforms.koFi.enabled && 
      isValidUsername(supportConfig.platforms.koFi.username, 'your-ko-fi-username')) {
    platforms.push('ko-fi');
  }
  
  if (supportConfig.platforms.buyMeACoffee.enabled && 
      isValidUsername(supportConfig.platforms.buyMeACoffee.username, 'your-bmc-username')) {
    platforms.push('buy-me-a-coffee');
  }
  
  return platforms;
}

/**
 * Get Ko-fi URL
 * Returns custom URL if provided, otherwise constructs URL from username
 */
export function getKoFiUrl(username: string, customUrl?: string): string {
  return customUrl || `https://ko-fi.com/${username}`;
}

/**
 * Get Buy Me a Coffee URL
 * Returns custom URL if provided, otherwise constructs URL from username
 */
export function getBMCUrl(username: string, customUrl?: string): string {
  return customUrl || `https://buymeacoffee.com/${username}`;
}
