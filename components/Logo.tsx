import Image from "next/image";

type LogoProps = {
  variant?: "default" | "sidebar" | "auth" | "admin";
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textVariant?: "PARTNERS" | "PARTNERS LLC";
};

export function Logo({ variant = "default", size = "md", showText = true, textVariant = "PARTNERS" }: LogoProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-xl",
    xl: "text-2xl",
  };

  if (variant === "auth") {
    return (
      <div className="flex flex-col items-center space-y-2">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-500 overflow-hidden">
            <Image
              src="/logo_partnershub_blanc.png"
              alt="PARTNERS Logo"
              width={48}
              height={48}
              className="object-contain"
              priority
            />
          </div>
          {showText && (
            <div>
              <div className="text-2xl font-bold text-white">PARTNERS</div>
              <div className="text-xs text-neutral-400">LLC Formation Platform</div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (variant === "sidebar") {
    return (
      <div className="mb-8 flex items-center">
        <div className="flex h-10 w-full items-center justify-center flex-shrink-0">
          <Image
            src="/logo_partnershub_blanc.png"
            alt="PARTNERS Logo"
            width={200}
            height={40}
            className="object-contain w-full h-full"
            priority
            unoptimized
          />
        </div>
      </div>
    );
  }

  if (variant === "admin") {
    return (
      <div className="mb-8">
        <div className="mb-2 flex items-center">
          <div className="flex h-10 w-full items-center justify-center flex-shrink-0">
            <Image
              src="/logo_partnershub_blanc.png"
              alt="PARTNERS Logo"
              width={200}
              height={40}
              className="object-contain w-full h-full"
              priority
              unoptimized
            />
          </div>
        </div>
        <div className="text-sm text-neutral-400">BACK-OFFICE</div>
      </div>
    );
  }

  // Default variant
  return (
    <div className="flex items-center gap-3">
      <div className={`flex ${sizeClasses[size]} items-center justify-center rounded-lg bg-gradient-to-br from-green-400 to-green-600 overflow-hidden`}>
        <Image
          src="/logo_partnershub_blanc.png"
          alt="PARTNERS Logo"
          width={size === "sm" ? 32 : size === "md" ? 40 : 48}
          height={size === "sm" ? 32 : size === "md" ? 40 : 48}
          className="object-contain"
          priority
        />
      </div>
      {showText && <span className={`${textSizes[size]} font-bold`}>{textVariant}</span>}
    </div>
  );
}

