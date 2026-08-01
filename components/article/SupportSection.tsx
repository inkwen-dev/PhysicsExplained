import { getSupportConfig, getEnabledPlatforms, getKoFiUrl, getBMCUrl } from '@/config/support';
import { cn } from '@/lib/utils';

interface SupportSectionProps {
  className?: string;
  variant?: 'default' | 'inline'; // Support different style variants
}

// Common support button component
function SupportButton({
  href,
  text,
  variant,
  showFeeLabel = false
}: {
  href: string;
  text: string;
  variant: 'primary' | 'secondary';
  showFeeLabel?: boolean;
}) {
  const buttonClasses = variant === "primary"
    ? "inline-flex items-center gap-2 bg-accent hover:bg-accent-light text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
    : "inline-flex items-center gap-2 bg-surface border-2 border-accent text-accent hover:bg-accent/10 px-6 py-3 rounded-lg font-medium text-base transition-colors";
  
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={buttonClasses}
    >
      <span>☕</span>
      <span>{text}</span>
      {showFeeLabel && (
        <span className="text-xs text-text-secondary ml-1">(0% fee)</span>
      )}
    </a>
  );
}

// Buy Me a Coffee button wrapper
function BuyMeACoffeeButton({ 
  username, 
  url, 
  buttonText,
  variant = "primary"
}: { 
  username: string; 
  url?: string; 
  buttonText: string;
  variant?: "primary" | "secondary";
}) {
  const bmcUrl = getBMCUrl(username, url);
  return <SupportButton href={bmcUrl} text={buttonText} variant={variant} />;
}

// Ko-fi button wrapper
function KoFiButton({ 
  username, 
  url, 
  buttonText,
  variant = "secondary"
}: { 
  username: string; 
  url?: string; 
  buttonText: string;
  variant?: "primary" | "secondary";
}) {
  const koFiUrl = getKoFiUrl(username, url);
  return (
    <SupportButton 
      href={koFiUrl} 
      text={buttonText} 
      variant={variant}
      showFeeLabel={variant === "secondary"}
    />
  );
}

export default function SupportSection({ 
  className,
  variant = 'default'
}: SupportSectionProps) {
  const config = getSupportConfig();
  
  if (!config.enabled) {
    return null;
  }
  
  const enabledPlatforms = getEnabledPlatforms();
  
  if (enabledPlatforms.length === 0) {
    // Log warning in development mode
    if (process.env.NODE_ENV === 'development') {
      console.warn('No valid support platforms configured. SupportSection will not be displayed.');
    }
    return null;
  }
  
  const containerClasses = variant === 'inline' 
    ? cn("mt-6", className)
    : cn("mt-12 pt-8 border-t border-border max-w-4xl mx-auto", className);
  
  // Determine primary and secondary platforms
  const hasBMC = enabledPlatforms.includes('buy-me-a-coffee');
  const hasKoFi = enabledPlatforms.includes('ko-fi');
  
  return (
    <div className={containerClasses}>
      <h2 className="text-2xl font-semibold mb-4 text-primary">
        {config.texts.title}
      </h2>
      <p className="text-text-secondary mb-6">
        {config.texts.subtitle}
      </p>
      
      {/* Support Buttons - Visual Hierarchy */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        {/* Primary Button: Buy Me a Coffee (if enabled) */}
        {hasBMC && (
          <BuyMeACoffeeButton 
            username={config.platforms.buyMeACoffee.username}
            url={config.platforms.buyMeACoffee.url}
            buttonText={config.texts.bmcButtonText || 'Buy Me a Coffee'}
            variant="primary"
          />
        )}
        
        {/* Secondary Button: Ko-fi (if enabled) */}
        {hasKoFi && (
          <KoFiButton 
            username={config.platforms.koFi.username}
            url={config.platforms.koFi.url}
            buttonText={config.texts.koFiButtonText || 'Support via Ko-fi'}
            variant={hasBMC ? "secondary" : "primary"}
          />
        )}
      </div>
    </div>
  );
}
